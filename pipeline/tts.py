"""B3 — Sinh giọng đọc bằng edge-tts, kèm mốc thời gian từng chữ.

Mỗi cảnh được đọc riêng để lấy đúng thời lượng cảnh, sau đó ghép lại kèm
khoảng lặng chuyển cảnh. Nếu tổng thời lượng lệch khung 45–60s, tốc độ đọc
được tự động điều chỉnh rồi đọc lại (tối đa 3 vòng).
"""
from __future__ import annotations

import argparse
import asyncio
import json
import re
import subprocess
import time
from pathlib import Path

import edge_tts

from . import timing
from .common import ROOT, load_config, log, step, syllables

TICKS = 10_000_000          # edge-tts trả mốc thời gian theo đơn vị 100ns
SCENE_GAP = timing.SCENE_GAP   # khoảng lặng tối thiểu giữa các cảnh (giây)
MAX_HOLD = 3.0                 # trần thời gian giữ thêm cho một cảnh quá ngắn

# Dịch vụ giọng đọc của Microsoft là cổng không chính thức và có hạn mức theo IP.
# Số đo thực (12 đoạn, cùng một thời điểm):
#     3 kết nối / giãn 0,6s → hỏng 8/12
#     2 kết nối / giãn 0,8s → hỏng 2/12
#     1 kết nối tuần tự     → hỏng 3/12
# Gọi tuần tự vẫn hỏng, nên đây KHÔNG thuần là vấn đề song song — dùng nhiều thì
# bị siết. Hai kết nối là điểm cân bằng tốt nhất đo được, nhưng thứ thật sự giữ
# cho dây chuyền chạy được là cơ chế đọc lại bên dưới.
MAX_PARALLEL = 2
OPEN_INTERVAL = 0.8            # giây, khoảng cách tối thiểu giữa hai lần mở kết nối
SPEAK_TRIES = 5                # số lần thử mỗi đoạn trước khi bỏ cuộc

# Mức siết của dịch vụ thay đổi theo ngày và theo địa chỉ IP. Có những lúc hai
# kết nối song song hỏng gần hết, mà gọi tuần tự lại chạy trơn: số đo ngày
# 21/09/2026 trên cùng một kịch bản 9 đoạn, cùng một khoảng thời gian —
#     2 kết nối / 5 lần thử  → gãy cả lần chạy
#     tuần tự  / 1 lần thử   → 9/9
# Nên vòng chạy nhanh vẫn giữ nguyên, nhưng đoạn nào rớt sẽ được đọc lại một
# lượt nữa theo kiểu tuần tự, giãn rộng. Chậm hơn, mà chậm còn hơn mất trắng.
SERIAL_INTERVAL = 2.0          # giây giữa hai đoạn ở vòng đọc lại tuần tự

# Lỗi không rải đều mà đi thành cụm. Đếm 40 lần gọi liên tiếp cách nhau 1 giây:
# 36 lần được, cụm rớt dài nhất 2 lần — tức bình thường 5 lần thử là quá đủ.
# Nhưng dịch vụ có những khoảng "sập" kéo dài vài phút, và trong khoảng đó thì
# 5 lần thử với nhịp chờ 2·n giây chỉ trải trong 20 giây, nằm gọn trong vùng
# sập nên rớt cả 5. Vòng vớt vì vậy phải kiên nhẫn theo ĐỒNG HỒ, không phải
# theo số lần: 6 lần thử với nhịp chờ 8·n giây trải ra khoảng 2 phút, đủ để
# vượt qua một khoảng sập. Chỉ chạy khi lần render sắp mất trắng nên chậm
# thêm hai phút là đánh đổi đáng.
SERIAL_TRIES = 6
SERIAL_BACKOFF = 8.0


def ffprobe_duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        capture_output=True, text=True, check=True).stdout.strip()
    return float(out)


async def _speak(text: str, voice: dict, dest: Path, tries: int = SPEAK_TRIES,
                 backoff: float = 2.0) -> list[dict]:
    """Đọc 1 đoạn -> file mp3 + danh sách {text, start, dur} của từng chữ.

    Dịch vụ trả về rỗng (NoAudioReceived) khá thường xuyên khi bị siết hạn mức.
    Với tỉ lệ hỏng 25% mỗi lần gọi, thử 5 lần thì xác suất một đoạn hỏng hẳn còn
    khoảng 0,1% — đủ để một video 12 cảnh gần như luôn dựng xong.
    Không thử lại thì một đoạn hỏng làm mất trắng cả lần chạy, đã xảy ra thật.
    """
    last_error: Exception | None = None
    for attempt in range(1, tries + 1):
        try:
            return await _speak_once(text, voice, dest)
        except Exception as e:      # noqa: BLE001 — thư viện ném nhiều loại lỗi
            last_error = e
            if attempt < tries:
                await asyncio.sleep(backoff * attempt)   # chờ tăng dần, cũng để giãn nhịp
                # Hỏng một hai lần là chuyện thường, không cần báo. Từ lần thứ ba
                # trở đi mới đáng chú ý — lúc đó dịch vụ đang siết mạnh.
                if attempt >= 2:
                    log(f"  đoạn này đã thử {attempt + 1} lần ({type(e).__name__})")
    raise RuntimeError(
        f"Không đọc được đoạn sau {tries} lần thử ({type(last_error).__name__}: {last_error}).\n"
        f"  Đoạn: {text[:80]}…"
    ) from last_error


async def _speak_once(text: str, voice: dict, dest: Path) -> list[dict]:
    comm = edge_tts.Communicate(
        text, voice["id"],
        rate=voice.get("rate", "+0%"),
        pitch=voice.get("pitch", "+0Hz"),
        volume=voice.get("volume", "+0%"),
        boundary="WordBoundary",     # bắt buộc: mặc định chỉ trả mốc theo câu
    )
    words: list[dict] = []
    with dest.open("wb") as fh:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                fh.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                words.append({
                    "text": chunk["text"],
                    "start": chunk["offset"] / TICKS,
                    "dur": chunk["duration"] / TICKS,
                })
    return words


async def _speak_all(scenes: list[dict], voice: dict, workdir: Path) -> list[dict]:
    """Đọc tất cả các cảnh, có trần số kết nối và giãn cách giữa các lần mở."""
    gate = asyncio.Semaphore(MAX_PARALLEL)
    pace = asyncio.Lock()
    last_open = 0.0

    async def wait_turn() -> None:
        """Bảo đảm hai lần mở kết nối cách nhau ít nhất OPEN_INTERVAL giây."""
        nonlocal last_open
        async with pace:
            cho = OPEN_INTERVAL - (time.monotonic() - last_open)
            if cho > 0:
                await asyncio.sleep(cho)
            last_open = time.monotonic()

    async def one(i: int, scene: dict) -> list[dict]:
        async with gate:
            await wait_turn()
            return await _speak(scene["vo"], voice, workdir / f"vo_{i:02d}.mp3")

    ket_qua = await asyncio.gather(*(one(i, s) for i, s in enumerate(scenes)),
                                   return_exceptions=True)

    # Vòng vớt: đoạn nào rớt thì đọc lại từng đoạn một, không song song.
    rot = [i for i, r in enumerate(ket_qua) if isinstance(r, BaseException)]
    if rot:
        log(f"{len(rot)}/{len(scenes)} đoạn rớt khi chạy song song — đọc lại tuần tự")
        for i in rot:
            await asyncio.sleep(SERIAL_INTERVAL)
            ket_qua[i] = await _speak(scenes[i]["vo"], voice, workdir / f"vo_{i:02d}.mp3",
                                      tries=SERIAL_TRIES, backoff=SERIAL_BACKOFF)
        log(f"✓ vớt lại được {len(rot)} đoạn")

    return list(ket_qua)


def _gaps_for(durations: list[float], kinds: list[str], min_scene: float) -> list[float]:
    """Khoảng lặng sau mỗi cảnh.

    Tin nào chỉ có mỗi tiêu đề sẽ đọc xong trong 2–3 giây — quá nhanh để người
    xem kịp đọc chữ trên màn hình. Những cảnh đó được giữ thêm bằng khoảng lặng
    cho đủ min_scene, nên nhịp video đều hơn mà không phải bịa thêm lời.
    """
    gaps: list[float] = []
    for i, (dur, kind) in enumerate(zip(durations, kinds)):
        if i == len(durations) - 1:
            gaps.append(0.0)                       # cảnh cuối không cần khoảng lặng
            continue
        hold = SCENE_GAP
        if kind == "news" and dur < min_scene:
            hold = min(SCENE_GAP + MAX_HOLD, SCENE_GAP + (min_scene - dur))
        gaps.append(round(hold, 3))
    return gaps


def _shift_pct(rate: str, factor: float, lo: int, hi: int) -> str:
    """Đổi '+10%' thành tốc độ mới theo hệ số, kẹp trong khoảng cho phép."""
    cur = int(re.sub(r"[^0-9\-+]", "", rate) or 0)
    speed = (1 + cur / 100) * factor
    pct = max(lo, min(hi, round((speed - 1) * 100)))
    return f"{pct:+d}%"


def synthesize(script: dict, cfg: dict, workdir: Path) -> dict:
    step("B3 · Sinh giọng đọc")
    workdir.mkdir(parents=True, exist_ok=True)
    scenes = script["scenes"]
    voice = dict(script.get("voice") or cfg["voice"])
    lo, hi = cfg["video"]["target_min_sec"], cfg["video"]["target_max_sec"]
    min_scene = cfg["video"].get("min_scene_sec", 0.0)
    kinds = [s["kind"] for s in scenes]

    per_scene_words: list[list[dict]] = []
    durations: list[float] = []
    gaps: list[float] = []
    attempt = 0
    for attempt in range(1, 4):
        per_scene_words = asyncio.run(_speak_all(scenes, voice, workdir))
        durations = [ffprobe_duration(workdir / f"vo_{i:02d}.mp3") for i in range(len(scenes))]
        gaps = _gaps_for(durations, kinds, min_scene)
        total = sum(durations) + sum(gaps)
        log(f"lần {attempt}: tốc độ {voice['rate']} → {total:.1f}s")
        if lo <= total <= hi:
            break
        # Nhắm vào mép trong của khung chứ không phải tâm khung: lệch 1 giây mà
        # kéo tốc độ về giữa thì đọc nhanh/chậm hơn mức mong muốn một cách vô cớ.
        goal = (hi - 3) if total > hi else (lo + 3)
        factor = total / goal                        # >1 nghĩa là đang dài, cần đọc nhanh hơn
        new_rate = _shift_pct(voice["rate"], factor, cfg["voice"]["rate_min_pct"], cfg["voice"]["rate_max_pct"])
        if new_rate == voice["rate"]:
            log("đã chạm giới hạn tốc độ cho phép, giữ nguyên")
            break
        voice["rate"] = new_rate

    # Ghép các đoạn thành 1 track, chèn khoảng lặng giữa các cảnh.
    timeline: list[dict] = []
    words: list[dict] = []
    cursor = 0.0
    held = 0
    for i, (scene, dur, ws) in enumerate(zip(scenes, durations, per_scene_words)):
        timeline.append({**{k: v for k, v in scene.items()}, "start": round(cursor, 3),
                         "dur": round(dur, 3), "audio": f"vo_{i:02d}.mp3"})
        for w in ws:
            words.append({"text": w["text"], "start": round(cursor + w["start"], 3),
                          "dur": round(w["dur"], 3), "scene": i})
        if gaps[i] > SCENE_GAP + 0.01:
            held += 1
        cursor += dur + gaps[i]
    if held:
        log(f"giữ thêm {held} cảnh ngắn cho đủ {min_scene:.0f}s mỗi cảnh")

    voice_path = workdir / "voice.mp3"
    _concat_audio([workdir / f"vo_{i:02d}.mp3" for i in range(len(scenes))], gaps, voice_path)
    total = ffprobe_duration(voice_path)
    log(f"✓ {voice_path.name} · {total:.2f}s · {len(words)} chữ có mốc thời gian")

    # Ghi lại để lần sau khâu dựng kịch bản ước lượng sát hơn.
    timing.record(voice["id"], voice["rate"],
                  sum(syllables(s["vo"]) for s in scenes), len(scenes),
                  speech=sum(durations), duration=total)

    return {"voice": voice, "total": round(total, 3), "attempts": attempt,
            "scenes": timeline, "words": words, "audio": str(voice_path)}


def _concat_audio(parts: list[Path], gaps: list[float], dest: Path) -> None:
    """Nối các mp3 kèm khoảng lặng riêng cho từng cảnh, chuẩn hoá âm lượng."""
    inputs: list[str] = []
    for p in parts:
        inputs += ["-i", str(p)]
    n = len(parts)
    chain = []
    for i in range(n):
        chain.append(f"[{i}:a]aresample=24000,aformat=sample_fmts=fltp:channel_layouts=mono[a{i}]")
    segs = "".join(f"[a{i}][s{i}]" if i < n - 1 else f"[a{i}]" for i in range(n))
    for i in range(n - 1):
        chain.append(f"anullsrc=r=24000:cl=mono:d={gaps[i]}[s{i}]")
    filt = (";".join(chain)
            + f";{segs}concat=n={2 * n - 1}:v=0:a=1,loudnorm=I=-16:TP=-1.5:LRA=11[out]")
    subprocess.run(
        ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *inputs,
         "-filter_complex", filt, "-map", "[out]",
         "-c:a", "libmp3lame", "-q:a", "2", str(dest)],
        check=True)


def main() -> None:
    ap = argparse.ArgumentParser(description="Sinh giọng đọc cho kịch bản")
    ap.add_argument("--script", default=str(ROOT / "output" / "script.json"))
    ap.add_argument("--workdir", default=str(ROOT / "output" / "_work"))
    args = ap.parse_args()

    cfg = load_config()
    script = json.loads(Path(args.script).read_text(encoding="utf-8"))
    result = synthesize(script, cfg, Path(args.workdir))
    out = Path(args.workdir) / "voice.json"
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    log(f"→ {out}")
    for s in result["scenes"]:
        print(f"   {s['kind']:<5} {s['start']:>6.2f}s  +{s['dur']:>5.2f}s")


if __name__ == "__main__":
    main()
