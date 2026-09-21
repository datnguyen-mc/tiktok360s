"""Đẩy kết quả mỗi lần chạy sang CMS Laravel.

Nguyên tắc: **CMS hỏng thì video vẫn phải ra**. Mọi lỗi ở đây chỉ in cảnh báo
rồi đi tiếp, không bao giờ làm gãy dây chuyền. Dữ liệu vẫn nằm nguyên trong
output/<ngày>/, nạp lại lúc nào cũng được bằng `make cms-push`.

Khoá xác thực đọc theo thứ tự: biến môi trường INGEST_TOKEN → cms/.env.
"""
from __future__ import annotations

import json
import os
import re
import urllib.error
import urllib.request
from pathlib import Path

from .common import ROOT, log

DEFAULT_URL = "http://127.0.0.1:8000"


def _env_from_file(key: str) -> str:
    """Đọc một biến trong cms/.env — tránh phải khai khoá ở hai nơi."""
    env_file = ROOT / "cms" / ".env"
    if not env_file.exists():
        return ""
    for line in env_file.read_text(encoding="utf-8").splitlines():
        m = re.match(rf"\s*{key}\s*=\s*(.*)", line)
        if m:
            return m.group(1).strip().strip('"').strip("'")
    return ""


def config(cfg: dict) -> dict:
    c = cfg.get("cms", {})
    return {
        "enabled": bool(c.get("enabled", True)),
        "url": (os.environ.get("CMS_URL") or c.get("url") or DEFAULT_URL).rstrip("/"),
        "token": os.environ.get("INGEST_TOKEN") or _env_from_file("INGEST_TOKEN"),
    }


def _rel(path: str | Path) -> str:
    """Đường dẫn tương đối so với gốc project, để CMS ghép lại được."""
    p = Path(path)
    try:
        return str(p.resolve().relative_to(ROOT))
    except ValueError:
        return str(p)


def build_payload(script: dict, voice: dict | None, video: Path | None,
                  thumbnail: Path | None, status: str = "success",
                  error: str = "") -> dict:
    """Gom dữ liệu một lần chạy thành gói gửi đi."""
    scenes = (voice or {}).get("scenes") or script["scenes"]
    news = [s for s in scenes if s.get("kind") == "news"]

    items = []
    for i, s in enumerate(news, start=1):
        items.append({
            "position": s.get("index", i),
            "headline": s.get("headline", "")[:500],
            "source": s.get("source") or None,
            "url": s.get("url") or None,
            "image_url": s.get("image") or None,
            "score": s.get("score"),
            "topic": s.get("topic") or None,
            "reaction": s.get("reaction") or None,
            "vo": s.get("vo"),
            "clip_prompt": s.get("clip_prompt"),
            "clip_url": s.get("clip_url"),
            "clip_cost_usd": s.get("clip_cost_usd"),
            "scene_start": s.get("start"),
            "scene_dur": s.get("dur"),
        })

    return {
        "run_date": script["date"],
        "topic": script.get("topic"),
        "topic_name": script.get("topic_name"),
        "status": status,
        "title": script.get("title"),
        "style": script.get("style"),
        "clip_provider": script.get("clip_provider"),
        "prompt_template": script.get("prompt_template"),
        "generation_cost_usd": script.get("generation_cost_usd"),
        "voice_id": (voice or {}).get("voice", {}).get("id") or script["voice"]["id"],
        "voice_rate": (voice or {}).get("voice", {}).get("rate") or script["voice"]["rate"],
        "items_count": len(news),
        "scenes_count": len(scenes),
        "syllables": sum(len((s.get("vo") or "").split()) for s in scenes),
        "duration_sec": (voice or {}).get("total"),
        "estimated_sec": script.get("estimated_sec"),
        "tts_attempts": (voice or {}).get("attempts", 1),
        # Đường dẫn máy vẫn giữ: R2 hỏng hay chưa bật thì CMS còn chỗ đọc file.
        "video_url": None,
        "thumbnail_url": None,
        "video_path": _rel(video) if video else None,
        "video_bytes": video.stat().st_size if video and video.exists() else None,
        "thumbnail_path": _rel(thumbnail) if thumbnail and thumbnail.exists() else None,
        "caption": script.get("caption"),
        "started_at": script.get("generated_at"),
        "finished_at": script.get("generated_at"),
        "error_message": error or None,
        "items": items,
        "clip_calls": script.get("clip_calls") or [],
    }


def push(payload: dict, cfg: dict) -> bool:
    """Gửi sang CMS. Trả về True nếu thành công; lỗi chỉ cảnh báo, không ném ra."""
    conf = config(cfg)
    if not conf["enabled"]:
        return False
    if not conf["token"]:
        log("⚠ CMS: chưa có INGEST_TOKEN (xem cms/.env) — bỏ qua bước lưu dữ liệu")
        return False

    req = urllib.request.Request(
        f"{conf['url']}/api/ingest/run",
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-Ingest-Token": conf["token"],
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            body = json.loads(resp.read().decode("utf-8"))
        log(f"✓ CMS: đã lưu lần chạy #{body.get('id')} ({conf['url']})")
        return True
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:300]
        log(f"⚠ CMS: lưu thất bại HTTP {e.code} — {detail}")
    except Exception as e:
        log(f"⚠ CMS: không kết nối được {conf['url']} ({e}) — dữ liệu vẫn nằm ở output/")
    return False


def push_from_output(date: str, cfg: dict) -> bool:
    """Nạp lại một ngày đã render từ thư mục output (dùng cho `make cms-push`)."""
    from .topics import output_dir
    outdir = output_dir(cfg, date)
    script_file = outdir / "script.json"
    if not script_file.exists():
        log(f"⚠ không có {script_file}")
        return False

    script = json.loads(script_file.read_text(encoding="utf-8"))
    videos = sorted(outdir.glob("*.mp4"))
    video = videos[0] if videos else None
    thumb = outdir / "thumbnail.jpg"

    # File trung gian đã dọn nên không còn voice.json. Thời lượng và mốc từng
    # cảnh dựng lại được: tổng lấy từ chính file video, mốc cảnh suy ra từ
    # voice.json nếu còn, không thì bỏ trống — vẫn đủ để theo dõi.
    voice = None
    work_voice = outdir / "_work" / "voice.json"
    if work_voice.exists():
        voice = json.loads(work_voice.read_text(encoding="utf-8"))
    elif video and video.exists():
        from .tts import ffprobe_duration
        voice = {"total": round(ffprobe_duration(video), 3)}

    return push(build_payload(script, voice, video,
                              thumb if thumb.exists() else None), cfg)
