"""B2 — Dựng kịch bản 45–60s: hook, các tin, chốt CTA + caption đăng bài.

Cách canh thời lượng: mỗi tin bắt đầu bằng "câu lõi" (tiêu đề đầy đủ), sau đó
lần lượt thêm câu chi tiết theo vòng cho tới khi chạm ngân sách thời lượng.
Nhờ vậy video luôn rơi vào khung 45–60s mà không bị cắt cụt giữa câu.
"""
from __future__ import annotations

import argparse
import json
import random
from datetime import datetime
from pathlib import Path

from . import styles, timing
from .common import (ROOT, load_config, log, shorten, step, syllables,
                     to_spoken, trim_clause)
from .fetch_news import collect

_VI_NUM = {1: "một", 2: "hai", 3: "ba", 4: "bốn", 5: "năm", 6: "sáu", 7: "bảy",
           8: "tám", 9: "chín", 10: "mười", 11: "mười một", 12: "mười hai"}


def _vi_num(n: int) -> str:
    return _VI_NUM.get(n, str(n))


def _duration_phrase(cfg: dict) -> str:
    """Mô tả độ dài video bằng lời, bám theo khung mục tiêu trong config."""
    center = (cfg["video"]["target_min_sec"] + cfg["video"]["target_max_sec"]) / 2
    if center < 40:
        return "trong nửa phút"
    if center < 75:
        return "trong một phút"
    if center < 105:
        return "trong 90 giây"
    if center < 150:
        return "trong hai phút"
    return f"trong {round(center / 60)} phút"


def _connectors(n: int, st: dict) -> list[str]:
    """Lời dẫn giữa các tin.

    Từ 6 tin trở lên thì bỏ hẳn lời dẫn: mỗi câu "Tin thứ tư" ngốn 3 âm tiết,
    nhân với 10 tin là mất gần 8 giây — đủ để mất trọn một tin. Số thứ tự đã
    hiện sẵn trên màn hình ("TIN 4/10") nên người xem vẫn theo kịp.
    """
    if n <= 1:
        return [""]
    if n <= 5:
        return st["connectors"][: n - 1] + [st["connector_cuoi"]]
    return [""] * (n - 1) + [st["connector_cuoi"]]


def _compose(scene: dict) -> str:
    """Ghép lời dẫn + tiêu đề + chi tiết + câu cảm thán thành lời đọc."""
    lead = f"{scene['_conn']}. " if scene["_conn"] else ""
    parts = [lead + scene["_title"]] + scene["_extra"][: scene["_used"]]
    if scene.get("_react"):
        parts.append(scene["_react"])
    return to_spoken(" ".join(parts))


def _rut_cam_than(cfg: dict, st: dict, rng: random.Random):
    """Chọn câu cảm thán hợp nhóm tin, không lặp lại trong cùng một video."""
    da_dung: set[str] = set()

    def rut(tieu_de: str, sapo: str = "") -> str:
        kho = st.get("reactions") or {}
        if not kho:
            return ""
        nhom = styles.nhom_cua(cfg, tieu_de, sapo)
        ung_vien = [c for c in kho.get(nhom, []) if c not in da_dung]
        if not ung_vien:                                  # nhóm đã dùng hết -> lấy câu chung
            ung_vien = [c for c in kho.get("chung", []) if c not in da_dung]
        if not ung_vien:
            return ""
        chon = rng.choice(ung_vien)
        da_dung.add(chon)
        return chon
    return rut


def build_scenes(items: list[dict], cfg: dict, seed: int | None = None,
                 ngay: datetime | None = None) -> list[dict]:
    today = ngay or datetime.now()
    rng = random.Random(seed if seed is not None else today.toordinal())
    st = styles.get(cfg)
    n = min(cfg["script"]["items_per_video"], len(items))
    picked = items[:n]

    intro = {
        "kind": "intro",
        "headline": st["tieu_de_intro"].format(n=n),
        "vo": to_spoken(rng.choice(st["hooks"]).format(n=_vi_num(n), day=today.day,
                                                       month=today.month,
                                                       dur=_duration_phrase(cfg))),
        "image": picked[0]["image"] if picked else "",
        "source": "", "url": "",
    }

    rut = _rut_cam_than(cfg, st, rng)
    moi = max(1, cfg["script"].get("reaction_every", 1))
    news: list[dict] = []
    hop_le = 0
    for i, (conn, it) in enumerate(zip(_connectors(n, st), picked), start=1):
        react = ""
        if styles.cho_phep_pha_tro(cfg, it["title"]):
            hop_le += 1
            if hop_le % moi == 0:
                react = rut(it["title"], " ".join(it.get("sentences", [])[:1]))
        news.append({
            "kind": "news",
            "index": i,
            "total": n,
            "headline": shorten(it["title"], cfg["script"]["headline_max_chars"]),
            "image": it["image"],
            "source": it["source"],
            "url": it["link"],
            "score": it.get("score"),
            "topic": styles.nhom_cua(cfg, it["title"], " ".join(it.get("sentences", [])[:1])),
            "reaction": react,        # giữ lại để CMS hiển thị, không chỉ nằm trong lời đọc
            "_conn": conn,
            "_title": to_spoken(it["title"]),
            "_extra": it.get("sentences", []),
            "_used": 0,
            "_react": react,
        })

    outro = {
        "kind": "outro",
        "headline": st["tieu_de_outro"],
        "vo": to_spoken(rng.choice(st["outros"])),
        "image": "", "source": "", "url": "",
    }
    return [intro] + news + [outro]


def fit_length(scenes: list[dict], cfg: dict) -> list[dict]:
    """Canh tổng thời lượng vào khung mục tiêu.

    Thứ tự ưu tiên khi phải cắt: bỏ câu chi tiết trước, rồi rút gọn tiêu đề,
    cuối cùng mới bỏ tin — và chỉ bỏ khi còn trên mức sàn min_items_per_video.
    Nhờ vậy yêu cầu "ít nhất N tin" luôn được giữ, phần hy sinh là chi tiết.
    """
    lo, hi = cfg["video"]["target_min_sec"], cfg["video"]["target_max_sec"]
    # Hai ngưỡng khác nhau, cố ý:
    #   ceiling — chỉ cắt khi kịch bản thật sự vượt trần
    #   target  — dựng tới giữa khung rồi dừng
    # Ước lượng theo số âm tiết có sai số cố hữu ~10% (tên riêng, từ nước ngoài đọc
    # chậm hơn hẳn từ thuần Việt, mà đếm âm tiết thì không thấy được điều đó). Nhắm
    # giữa khung thì lệch 10% về hướng nào cũng còn nằm trong 90–120s; nhắm sát trần
    # thì hễ lệch lên là phải tăng tốc độ đọc, nghe gấp gáp không cần thiết.
    ceiling = hi - 1.5
    target = (lo + hi) / 2
    floor_items = max(1, cfg["script"].get("min_items_per_video", 1))
    rate = cfg["voice"]["rate"]
    prm = timing.params(cfg["voice"]["id"])
    news = [s for s in scenes if s["kind"] == "news"]
    for s in news:
        s["vo"] = _compose(s)

    def total() -> float:
        syl = sum(syllables(s.get("vo", "")) for s in scenes)
        return timing.estimate(syl, len(scenes), rate, prm)

    st = styles.get(cfg)

    def renumber() -> None:
        for i, (conn, s) in enumerate(zip(_connectors(len(news), st), news), start=1):
            s["index"], s["total"], s["_conn"] = i, len(news), conn
            s["vo"] = _compose(s)

    # ---- quá dài: rút dần
    guard = 0
    while news and total() > ceiling and guard < 500:
        guard += 1
        longest = max(news, key=lambda s: syllables(s["vo"]))
        if longest["_used"] > 0:                        # 1. bỏ câu chi tiết
            longest["_used"] -= 1
        elif longest.get("_react"):                     # 2. bỏ câu cảm thán
            longest["_react"] = ""
            longest["reaction"] = ""
        else:
            shorter = trim_clause(longest["_title"])
            if shorter:                                 # 3. rút gọn tiêu đề
                longest["_title"] = shorter
            elif len(news) > floor_items:               # 4. bất đắc dĩ mới bỏ tin
                news.remove(longest)
                scenes.remove(longest)
                log(f"bỏ 1 tin cho vừa thời lượng (còn {len(news)})")
                renumber()
                continue
            else:
                log(f"⚠ đã rút hết mức mà vẫn dài — giữ đủ {floor_items} tin theo yêu cầu")
                break
        longest["vo"] = _compose(longest)

    # ---- còn dư chỗ: thêm câu chi tiết theo vòng
    # Trần mỗi tin giữ cho các cảnh dài xấp xỉ nhau; không có trần thì tin nào
    # có sapo dài sẽ ngốn hết chỗ, tạo ra cảnh 14 giây bên cạnh cảnh 3 giây.
    cap = cfg["script"].get("max_detail_sentences", 99)
    changed = True
    while changed and total() < target:
        changed = False
        for s in news:
            if s["_used"] >= min(cap, len(s["_extra"])):
                continue
            s["_used"] += 1
            before, s["vo"] = s["vo"], _compose(s)
            if total() > target:                        # quá giữa khung thì trả lại
                s["_used"] -= 1
                s["vo"] = before
                continue
            changed = True

    est = total()
    scenes[0]["_estimated_sec"] = round(est, 2)    # gắn tạm, build() sẽ nhấc ra
    flag = "✓" if lo <= est <= hi else "⚠"
    syl = sum(syllables(s.get("vo", "")) for s in scenes)
    log(f"{flag} {len(news)} tin · {syl} âm tiết · {len(scenes)} cảnh "
        f"· ước lượng {est:.1f}s (khung {lo}–{hi}s)")
    joke = sum(1 for s in news if s.get("_react"))
    log(f"giọng văn: {st['ten']} · {joke}/{len(news)} tin có câu cảm thán")
    log(f"tham số thời lượng: {prm['syl_per_sec_base']} âm tiết/giây, "
        f"nghỉ {prm['tts_pad']}s mỗi đoạn — {prm['source']}")
    for s in scenes:
        for key in ("_conn", "_title", "_extra", "_used", "_react"):
            s.pop(key, None)
    return scenes


def build_caption(scenes: list[dict], cfg: dict, ngay: datetime | None = None) -> dict:
    news = [s for s in scenes if s["kind"] == "news"]
    today = (ngay or datetime.now()).strftime("%d/%m/%Y")
    lines = [f"📌 Tin {cfg.get('topic_name', '')} {today} — {len(news)} tin nóng "
             f"{_duration_phrase(cfg)}".replace("  ", " "), ""]
    lines += [f"{i}. {shorten(s['headline'], 70)}" for i, s in enumerate(news, 1)]
    lines += ["", "Bạn quan tâm tin nào nhất? Comment bên dưới 👇",
              # Tagline lấy từ chủ đề, không gắn cứng "tin sao": kênh bóng đá và
              # kênh drama cũng dùng hàm này, và đã đăng ra caption sai một thời gian.
              f"Theo dõi {cfg['brand']['handle']} — "
              f"{(cfg['brand'].get('tagline') or 'cập nhật mỗi ngày').lower()}.", "",
              " ".join(cfg["hashtags"])]
    return {
        "caption": "\n".join(lines),
        "hashtags": cfg["hashtags"],
        "sources": [{"source": s["source"], "url": s["url"]} for s in news],
    }


def build(cfg: dict, items: list[dict] | None = None, seed: int | None = None,
          date: str | None = None) -> dict:
    """date = ngày của bản tin (YYYY-MM-DD); bỏ trống thì lấy hôm nay.

    Ngày này chạy xuyên suốt: câu mở đầu, tiêu đề, caption và nhãn trên video đều
    bám theo nó, nên video làm cho ngày cũ không bị ghi nhầm ngày hôm nay.
    """
    step("B2 · Dựng kịch bản")
    ngay = datetime.strptime(date, "%Y-%m-%d") if date else datetime.now()
    items = items if items is not None else collect(cfg, date)
    if not items:
        raise SystemExit("Không lấy được tin nào — kiểm tra mạng hoặc nguồn RSS trong config.json")

    scenes = fit_length(build_scenes(items, cfg, seed, ngay), cfg)
    estimated = scenes[0].pop("_estimated_sec", None)
    news = [s for s in scenes if s["kind"] == "news"]
    return {
        "estimated_sec": estimated,
        "style": cfg["script"].get("style", "chuan"),
        "date": ngay.strftime("%Y-%m-%d"),
        "topic": cfg.get("topic"),
        "topic_name": cfg.get("topic_name"),
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "title": f"Tin {cfg.get('topic_name', '')} {ngay.strftime('%d/%m')} — {len(news)} tin nóng".replace("  ", " "),
        "voice": cfg["voice"],
        "scenes": scenes,
        **build_caption(scenes, cfg, ngay),
    }


def main() -> None:
    ap = argparse.ArgumentParser(description="Dựng kịch bản video showbiz 45–60s")
    ap.add_argument("--news", default="", help="dùng lại file news.json thay vì tải mới")
    ap.add_argument("--out", default="")
    ap.add_argument("--seed", type=int, default=None)
    ap.add_argument("--topic", default="", help="chủ đề kênh")
    ap.add_argument("--date", default="", help="YYYY-MM-DD theo giờ VN")
    args = ap.parse_args()

    cfg = load_config(topic=args.topic or None)
    items = json.loads(Path(args.news).read_text(encoding="utf-8")) if args.news else None
    data = build(cfg, items, args.seed, args.date or None)

    out = Path(args.out) if args.out else ROOT / "output" / cfg["topic"] / "script.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    log(f"→ {out}")
    print()
    for s in data["scenes"]:
        print(f"[{s['kind']:<5}] {s['vo']}")
    print("\n--- CAPTION ---\n" + data["caption"])


if __name__ == "__main__":
    main()
