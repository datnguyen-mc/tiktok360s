"""Xem tham số thời lượng đang dùng và độ chính xác của chúng.

Pipeline tự ghi lại mỗi lần render vào output/.timing.json rồi khớp lại tham số,
nên công cụ này chủ yếu để kiểm tra: sai số còn bao nhiêu, đã đủ dữ liệu chưa,
và với cấu hình hiện tại thì kịch bản nên dài bao nhiêu âm tiết.
"""
from __future__ import annotations

import argparse

from . import timing
from .common import load_config, log, step


def main() -> None:
    ap = argparse.ArgumentParser(description="Kiểm tra tham số thời lượng")
    ap.add_argument("--reset", action="store_true", help="xoá lịch sử, quay về tham số mặc định")
    ap.add_argument("--topic", default="", help="chủ đề kênh")
    args = ap.parse_args()

    cfg = load_config(topic=args.topic or None)
    voice_id, rate = cfg["voice"]["id"], cfg["voice"]["rate"]

    if args.reset and timing.HISTORY.exists():
        timing.HISTORY.unlink()
        log("đã xoá lịch sử đo")

    step(f"Tham số thời lượng · {voice_id} · rate {rate}")
    prm = timing.params(voice_id)
    log(f"tốc độ đọc gốc : {prm['syl_per_sec_base']} âm tiết/giây (ở rate +0%)")
    log(f"nghỉ mỗi đoạn  : {prm['tts_pad']}s (chưa kể {timing.SCENE_GAP}s chuyển cảnh)")
    log(f"nguồn tham số  : {prm['source']}")

    samples = [s for s in timing._load() if s["voice"] == voice_id]
    if samples:
        print()
        log(f"{'âm tiết':>8} {'cảnh':>5} {'rate':>6} {'thực tế':>9} {'dự đoán':>9} {'lệch':>7}")
        for s in samples[-10:]:
            pred = timing.estimate(s["syllables"], s["scenes"], s["rate"], prm)
            log(f"{s['syllables']:>8} {s['scenes']:>5} {s['rate']:>6} "
                f"{s['duration']:>8.1f}s {pred:>8.1f}s {pred - s['duration']:>+6.1f}s")
        err = sum(abs(timing.estimate(s["syllables"], s["scenes"], s["rate"], prm) - s["duration"])
                  for s in samples) / len(samples)
        print()
        log(f"sai số trung bình: {err:.2f}s trên {len(samples)} lần render")
        if len(samples) < 2:
            log("cần ít nhất 2 lần render (khác số cảnh) mới tách được 2 tham số")
    else:
        print()
        log("chưa có lần render nào — đang dùng tham số mặc định.")
        log("chạy `make video` vài lần, tham số sẽ tự khớp theo giọng và nội dung của bạn.")

    lo, hi = cfg["video"]["target_min_sec"], cfg["video"]["target_max_sec"]
    items = cfg["script"]["items_per_video"]
    scenes = items + 2                       # cộng cảnh mở đầu và cảnh chốt
    f = timing.speed_factor(rate)
    r = prm["syl_per_sec_base"] * f
    print()
    log(f"với {items} tin ({scenes} cảnh) ở rate {rate}: kịch bản nên dài "
        f"{int((lo - prm['tts_pad'] * scenes - timing.SCENE_GAP * (scenes - 1)) * r)}–"
        f"{int((hi - prm['tts_pad'] * scenes - timing.SCENE_GAP * (scenes - 1)) * r)} "
        f"âm tiết cho {lo}–{hi}s")


if __name__ == "__main__":
    main()
