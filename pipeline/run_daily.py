"""Chạy trọn quy trình: lấy tin → kịch bản → giọng đọc → dựng hình → video.

Kết quả mỗi ngày nằm ở output/YYYY-MM-DD/:
  video.mp4      video dọc 1080x1920, 45–60s, đã có giọng đọc + phụ đề
  thumbnail.jpg  ảnh bìa gợi ý
  caption.txt    caption + hashtag để dán khi đăng
  script.json    kịch bản đầy đủ (sửa tay rồi render lại được)
  sources.txt    danh sách nguồn tin, dùng để ghi credit
"""
from __future__ import annotations

import argparse
import json
import shutil
import sys
import traceback
from datetime import datetime
from pathlib import Path

from . import aiclip, cms, r2, render, script_builder, tts, visuals, website
from .steps import StepTracker
from .common import ROOT as ROOT_DIR
from .common import load_config, log, slugify, step
from .topics import available as available_topics
from .topics import output_dir
from .fetch_news import collect_all


def _balance(items: list[dict], cfg: dict) -> list[dict]:
    """Cắt theo trần mỗi báo — chỉ áp dụng cho video, không áp cho website."""
    per_source: dict[str, int] = {}
    picked: list[dict] = []
    for it in items:
        n = per_source.get(it["source"], 0)
        if n >= cfg["ranking"]["max_per_source"]:
            continue
        per_source[it["source"]] = n + 1
        picked.append(it)

    need = cfg["script"].get("min_items_per_video", cfg["script"]["items_per_video"])
    log(f"→ {len(picked)} tin cho video (cần tối thiểu {need})")
    if len(picked) < need:
        log(f"⚠ thiếu {need - len(picked)} tin — nới max_per_source trong topics/{cfg['topic']}.json")
    return picked


def run(args: argparse.Namespace) -> int:
    cfg = load_config(args.config, args.topic or None)
    if args.items:
        cfg["script"]["items_per_video"] = args.items
    if args.voice:
        cfg["voice"]["id"] = args.voice
    if args.items:
        # số tin yêu cầu cũng là mức sàn — không để khâu canh thời lượng cắt bớt
        cfg["script"]["min_items_per_video"] = args.items

    date = args.date or datetime.now().strftime("%Y-%m-%d")
    outdir = output_dir(cfg, date)
    workdir = outdir / "_work"
    outdir.mkdir(parents=True, exist_ok=True)

    print(f"\n╔═ {cfg['brand']['name']} · {date} " + "═" * 28)
    tracker = StepTracker(cfg, date, enabled=not args.no_cms)

    # B1 + B2 — tin & kịch bản (hoặc dùng lại kịch bản đã sửa tay)
    if args.script:
        script = json.loads(Path(args.script).read_text(encoding="utf-8"))
        step("B1–B2 · Dùng kịch bản có sẵn")
        log(Path(args.script).name)
    else:
        with tracker.step("fetch") as st:
            if args.news:
                all_items = json.loads(Path(args.news).read_text(encoding="utf-8"))
            else:
                all_items = collect_all(cfg, args.date or None)
            st.note(f"{len(all_items)} tin sau khi lọc trùng", items=len(all_items),
                    sources=len(cfg.get("sources", [])))

        # Website nhận TOÀN BỘ tin; video chỉ lấy phần đã cân đều giữa các báo.
        if not args.no_web:
            with tracker.step("website", "Đẩy tin sang website") as st:
                added = website.push_articles(all_items, cfg)
                st.note(f"{added} bài mới", added=added, sent=len(all_items))

        items = _balance(all_items, cfg)

        with tracker.step("script") as st:
            script = script_builder.build(cfg, items, args.seed, args.date or None)
            news = [x for x in script["scenes"] if x["kind"] == "news"]
            st.note(f"{len(news)} tin · {len(script['scenes'])} cảnh "
                    f"· ước lượng {script.get('estimated_sec', 0):.0f}s",
                    items=len(news), scenes=len(script["scenes"]),
                    estimated_sec=script.get("estimated_sec"))
    (outdir / "script.json").write_text(json.dumps(script, ensure_ascii=False, indent=2), encoding="utf-8")

    if args.script_only:
        _write_sidecars(script, outdir)
        print(f"\n✓ Chỉ dựng kịch bản: {outdir / 'script.json'}\n")
        return 0

    # B3 — giọng đọc
    with tracker.step("tts") as st:
        voice = tts.synthesize(script, cfg, workdir)
        st.note(f"{voice['total']:.1f}s · {len(voice['words'])} chữ "
                f"· tốc độ {voice['voice']['rate']} · đọc {voice.get('attempts', 1)} vòng",
                duration_sec=voice["total"], words=len(voice["words"]),
                rate=voice["voice"]["rate"], voice_id=voice["voice"]["id"],
                attempts=voice.get("attempts", 1))
    (workdir / "voice.json").write_text(json.dumps(voice, ensure_ascii=False, indent=2), encoding="utf-8")

    # B4a — sinh cảnh bằng AI nếu CMS có bật engine Veo/Kling
    clips = {}
    if not args.no_ai:
        ai = aiclip.fetch_config(cfg, args.channel or None, args.engine or None)
        # Prompt truyền từ dòng lệnh (CMS bấm "Tạo video") đè lên prompt của kênh.
        if ai and args.prompt:
            ai["channel"]["prompt_template"] = args.prompt
        if ai and args.negative_prompt:
            ai["channel"]["negative_prompt"] = args.negative_prompt
        if ai:
            ai["date_label"] = script["date"]
            with tracker.step("aiclip") as st:
                clips = aiclip.generate_clips(voice["scenes"], ai, workdir)
                made = sum(1 for c in clips.values() if c.get("path"))
                cost = sum(c.get("cost", 0) for c in clips.values())
                st.note(f"{made}/{len(clips)} clip · {cost:.2f} USD",
                        clips_made=made, clips_total=len(clips), cost_usd=round(cost, 4),
                        provider=ai["engine"]["provider"], model=ai["engine"]["model"])
            script["clip_provider"] = ai["engine"]["provider"]
            script["prompt_template"] = ai["channel"]["prompt_template"]
            script["generation_cost_usd"] = round(
                sum(c.get("cost", 0) for c in clips.values()), 4)
            for i, scene in enumerate(voice["scenes"]):
                if i in clips:
                    scene["clip_prompt"] = clips[i].get("prompt")
                    scene["clip_url"] = clips[i].get("url")
                    scene["clip_cost_usd"] = clips[i].get("cost")

    # B4 — hình
    with tracker.step("visuals") as st:
        vis = visuals.build(script, voice, cfg, workdir, clips)
        st.note(f"{len(vis['scenes'])} cảnh · {len(vis['captions'])} khung phụ đề",
                scenes=len(vis["scenes"]), caption_frames=len(vis["captions"]))
    (workdir / "visuals.json").write_text(json.dumps(vis, ensure_ascii=False, indent=2), encoding="utf-8")

    # B5 — render
    name = f"{date}-{cfg['topic']}-{slugify(script['title'])}.mp4"
    with tracker.step("render") as st:
        video = render.build(voice, vis, cfg, workdir, outdir / name)
        mb = video.stat().st_size / 1e6
        st.note(f"{mb:.1f} MB · {voice['total']:.1f}s", size_mb=round(mb, 2),
                path=str(video.relative_to(ROOT_DIR)) if str(video).startswith(str(ROOT_DIR)) else name)
    shutil.copy(workdir / "thumbnail.jpg", outdir / "thumbnail.jpg")
    _write_sidecars(script, outdir)

    # B6 — đưa sản phẩm lên R2. Đặt trước bước lưu CMS để bản ghi có sẵn URL;
    # hỏng thì trả về rỗng và CMS chỉ lưu đường dẫn máy như trước.
    urls = {}
    if not args.no_r2:
        with tracker.step("upload") as st:
            urls = r2.upload_run(video, outdir / "thumbnail.jpg", cfg["topic"], date, cfg)
            st.note("đã lên R2" if urls else "bỏ qua R2", **urls)

    # Lưu vào CMS. Đặt sau khi video đã xong để bản ghi luôn phản ánh sản phẩm thật.
    if not args.no_cms:
        with tracker.step("publish") as st:
            payload = cms.build_payload(script, voice, video, outdir / "thumbnail.jpg")
            payload.update(urls)
            ok = cms.push(payload, cfg)
            st.note("đã lưu vào CMS" if ok else "CMS không phản hồi", saved=ok)

    if not args.keep_work:
        shutil.rmtree(workdir, ignore_errors=True)

    print(f"\n╚═ XONG · {video}")
    print(f"   thời lượng {voice['total']:.1f}s · caption: {outdir / 'caption.txt'}\n")
    return 0


def _write_sidecars(script: dict, outdir: Path) -> None:
    (outdir / "caption.txt").write_text(script["caption"], encoding="utf-8")
    lines = [f"- {s['source']}: {s['url']}" for s in script.get("sources", [])]
    (outdir / "sources.txt").write_text(
        "Nguồn tin sử dụng trong video:\n" + "\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    ap = argparse.ArgumentParser(description="Tạo video tin showbiz 45–60s cho TikTok")
    ap.add_argument("--topic", default="",
                    help=f"chủ đề kênh: {', '.join(available_topics()) or '(chưa có)'}")
    ap.add_argument("--date", default="",
                    help="YYYY-MM-DD theo giờ VN — lấy tin đăng đúng ngày đó (mặc định: tin mới nhất)")
    ap.add_argument("--items", type=int, default=0, help="số tin trong video (cũng là mức sàn)")
    ap.add_argument("--voice", default="", help="mã giọng edge-tts, vd vi-VN-NamMinhNeural")
    ap.add_argument("--seed", type=int, default=None, help="cố định cách chọn câu mở đầu")
    ap.add_argument("--news", default="", help="dùng lại file news.json")
    ap.add_argument("--script", default="", help="render từ kịch bản đã sửa tay")
    ap.add_argument("--script-only", action="store_true", help="chỉ dựng kịch bản, chưa render")
    ap.add_argument("--no-r2", action="store_true", help="không tải video lên R2")
    ap.add_argument("--keep-work", action="store_true", help="giữ lại file trung gian để gỡ lỗi")
    ap.add_argument("--no-cms", action="store_true", help="không gửi dữ liệu sang CMS")
    ap.add_argument("--no-web", action="store_true",
                    help="không đẩy tin sang website tin tức")
    ap.add_argument("--no-ai", action="store_true",
                    help="không sinh cảnh bằng AI dù CMS có bật (dùng ảnh báo)")
    ap.add_argument("--channel", type=int, default=0,
                    help="ID kênh — lấy prompt và engine riêng của kênh đó")
    ap.add_argument("--engine", type=int, default=0,
                    help="ID engine tạo video trong CMS (bỏ trống = engine mặc định)")
    ap.add_argument("--prompt", default="",
                    help="prompt tạo cảnh, đè lên prompt của kênh")
    ap.add_argument("--negative-prompt", dest="negative_prompt", default="",
                    help="prompt loại trừ")
    ap.add_argument("--config", default="", help="file cấu hình khác")
    args = ap.parse_args()

    try:
        sys.exit(run(args))
    except KeyboardInterrupt:
        sys.exit(130)
    except Exception as e:
        traceback.print_exc()
        # Báo thất bại về CMS: bảng điều khiển phải thấy được lần chạy hỏng,
        # nếu không thì sáng ra chỉ thấy "hôm nay không có video" mà không rõ vì sao.
        try:
            cfg = load_config(args.config, args.topic or None)
            date = args.date or datetime.now().strftime("%Y-%m-%d")
            cms.push({
                "run_date": date,
                "topic": cfg.get("topic"),
                "topic_name": cfg.get("topic_name"),
                "status": "failed",
                "title": f"Lỗi khi dựng video {date}",
                "error_message": f"{type(e).__name__}: {e}"[:2000],
                "items": [],
            }, cfg)
        except Exception:
            pass
        sys.exit(1)


if __name__ == "__main__":
    main()
