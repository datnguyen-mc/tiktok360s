"""Nghe thử các giọng đọc được tiếng Việt, rồi chọn giọng hợp kênh.

edge-tts chỉ có 2 giọng chuyên tiếng Việt, nhưng 12 giọng "đa ngữ" cũng đọc được
tiếng Việt và thường giàu ngữ điệu hơn — đổi lại có thể hơi lơ lớ ở dấu thanh.
Không có cách nào đánh giá bằng code: công cụ này đọc **cùng một đoạn tin** bằng
tất cả các giọng, ghép thành một file có lời xướng số thứ tự, để bạn nghe một lượt.
"""
from __future__ import annotations

import argparse
import asyncio
import subprocess
from pathlib import Path

import edge_tts

from .common import ROOT, load_config, log, step, syllables
from .topics import available as available_topics
from .tts import _speak, ffprobe_duration

MAU = ("Đầu tiên. Nữ ca sĩ bất ngờ thông báo hoãn toàn bộ lịch diễn trong tháng này. "
       "Phía công ty quản lý cho biết đây là quyết định khó khăn, và sẽ hoàn tiền vé "
       "cho khán giả đã đặt trước.")


async def _danh_sach() -> list[dict]:
    """Các giọng đọc được tiếng Việt: giọng vi-VN trước, rồi tới giọng đa ngữ."""
    tat_ca = await edge_tts.list_voices()
    vi = [v for v in tat_ca if v["Locale"].startswith("vi-")]
    da_ngu = [v for v in tat_ca if "Multilingual" in v["ShortName"]]
    return vi + da_ngu


def _xuong_so(i: int) -> str:
    return f"Giọng số {i}."


def main() -> None:
    ap = argparse.ArgumentParser(description="Nghe thử các giọng đọc tiếng Việt")
    ap.add_argument("--only-vi", action="store_true", help="chỉ 2 giọng chuyên tiếng Việt")
    ap.add_argument("--topics", action="store_true",
                    help="nghe giọng ĐANG DÙNG của từng chủ đề, đọc đúng câu mở của chủ đề đó")
    ap.add_argument("--rate", default="", help="tốc độ thử, mặc định lấy từ config")
    args = ap.parse_args()

    cfg = load_config()
    rate = args.rate or cfg["voice"]["rate"]
    outdir = ROOT / "output" / "_voices"
    outdir.mkdir(parents=True, exist_ok=True)

    if args.topics:
        return _thu_theo_chu_de(outdir)

    giong = asyncio.run(_danh_sach())
    if args.only_vi:
        giong = [v for v in giong if v["Locale"].startswith("vi-")]

    step(f"Đọc thử {len(giong)} giọng · rate {rate}")
    syl = syllables(MAU)
    phan: list[Path] = []
    ket_qua: list[tuple[str, float, str]] = []

    for i, v in enumerate(giong, start=1):
        ten = v["ShortName"]
        cau_hinh = {"id": ten, "rate": rate, "pitch": "+0Hz", "volume": "+0%"}
        mp3 = outdir / f"{i:02d}-{ten}.mp3"
        nhan = outdir / f"_nhan_{i:02d}.mp3"
        try:
            asyncio.run(_speak(MAU, cau_hinh, mp3))
            asyncio.run(_speak(_xuong_so(i), {"id": "vi-VN-HoaiMyNeural", "rate": "+0%",
                                              "pitch": "+0Hz", "volume": "+0%"}, nhan))
        except Exception as exc:
            log(f"✗ {ten}: {exc}")
            continue
        dur = ffprobe_duration(mp3)
        ket_qua.append((ten, syl / dur, v["Gender"]))
        phan += [nhan, mp3]
        log(f"{i:>2}. {ten:<34} {v['Gender']:<7} {dur:>5.1f}s  {syl / dur:.2f} âm tiết/giây")

    if not phan:
        raise SystemExit("Không đọc thử được giọng nào — kiểm tra kết nối mạng.")

    so_sanh = outdir / "so-sanh.mp3"
    danh_sach = outdir / "_ghep.txt"
    danh_sach.write_text("".join(f"file '{p.name}'\n" for p in phan), encoding="utf-8")
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                    "-f", "concat", "-safe", "0", "-i", str(danh_sach),
                    "-c:a", "libmp3lame", "-q:a", "3", str(so_sanh)], check=True)
    for f in outdir.glob("_nhan_*.mp3"):
        f.unlink()
    danh_sach.unlink()

    print()
    log(f"→ nghe một lượt: {so_sanh}")
    log(f"→ từng giọng riêng: {outdir}/")
    log("chọn xong thì đặt vào config.json:  \"voice\": { \"id\": \"<tên giọng>\" }")
    log("hoặc thử nhanh:  .venv/bin/python -m pipeline.run_daily --voice <tên giọng>")
    print()
    log("Lưu ý: giọng đa ngữ giàu ngữ điệu hơn nhưng có thể sai dấu thanh ở tên riêng.")
    log("Tốc độ đọc mỗi giọng một khác, nhưng lịch sử đo được tách riêng theo giọng —")
    log("đổi giọng xong chỉ cần render 2 lần là tham số tự khớp lại, không phải chỉnh tay.")


def _thu_theo_chu_de(outdir: Path) -> None:
    """Đọc thử giọng đang cấu hình của từng chủ đề, bằng chính câu mở của nó.

    Khác với việc nghe hết 14 giọng: ở đây nghe đúng thứ khán giả sẽ nghe —
    đúng giọng, đúng cao độ, đúng lời của kênh đó.
    """
    step("Nghe giọng của từng chủ đề")
    phan: list[Path] = []

    for slug in available_topics():
        cfg = load_config(topic=slug)
        voice = cfg["voice"]
        st = cfg.get("styles", {}).get(cfg.get("script", {}).get("style", "chuan"), {})
        hook = (st.get("hooks") or ["Xin chào bà con."])[0]
        mau = hook.replace("{n}", "mười").replace("{day}", "21").replace("{month}", "9") \
                  .replace("{dur}", "trong hai phút")
        # Lấy câu ở nhóm "chung" cho đại diện — nhóm đầu tiên trong file có thể
        # là chấn thương hay tranh cãi, nghe thử bằng câu đó thì không hình dung được.
        reactions = st.get("reactions") or {}
        pool = reactions.get("chung") or next((v for v in reactions.values() if v), [])
        cam_than = " " + pool[0] if pool else ""

        nhan = outdir / f"_nhan_{slug}.mp3"
        mp3 = outdir / f"chu-de-{slug}.mp3"
        try:
            asyncio.run(_speak(f"Chủ đề {cfg['topic_name']}.",
                               {"id": "vi-VN-HoaiMyNeural", "rate": "+0%",
                                "pitch": "+0Hz", "volume": "+0%"}, nhan))
            asyncio.run(_speak(mau + cam_than, voice, mp3))
        except Exception as exc:
            log(f"✗ {slug}: {exc}")
            continue

        dur = ffprobe_duration(mp3)
        log(f"{cfg['topic_name']:<12} {voice['id'].replace('vi-VN-', ''):<18} "
            f"pitch {voice.get('pitch', '+0Hz'):<7} {dur:>5.1f}s")
        log(f'   "{mau}{cam_than}"')
        phan += [nhan, mp3]

    if not phan:
        raise SystemExit("Không đọc thử được chủ đề nào.")

    so_sanh = outdir / "so-sanh-chu-de.mp3"
    danh_sach = outdir / "_ghep_ct.txt"
    danh_sach.write_text("".join(f"file '{p.name}'\n" for p in phan), encoding="utf-8")
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
                    "-f", "concat", "-safe", "0", "-i", str(danh_sach),
                    "-c:a", "libmp3lame", "-q:a", "3", str(so_sanh)], check=True)
    for f in outdir.glob("_nhan_*.mp3"):
        f.unlink()
    danh_sach.unlink()

    print()
    log(f"→ nghe một lượt: {so_sanh}")
    log("đổi giọng: sửa mục `voice` trong topics/<chủ đề>.json, hoặc trong CMS → Chủ đề kênh")


if __name__ == "__main__":
    main()
