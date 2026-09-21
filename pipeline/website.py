"""Đẩy tin đã thu thập sang website tin tức.

Mỗi ngày dây chuyền lấy về khoảng 350 tin cho hai chủ đề nhưng chỉ dùng 20 cho
video — phần còn lại trước đây bị bỏ đi. Module này gửi TOÀN BỘ sang website,
nên trang tin luôn có nội dung mới mà không tốn thêm một lần gọi mạng nào.

Website tự lo chuyện trùng lặp (so vân tay tiêu đề), nên gửi lại cùng một tin
nhiều lần cũng không sinh bài trùng.

Website tắt cũng không sao: mọi lỗi chỉ in cảnh báo, dây chuyền chạy tiếp.
"""
from __future__ import annotations

import json
import os
import re
import urllib.error
import urllib.request

from .common import ROOT, log

DEFAULT_URL = "http://127.0.0.1:8001"
CHUNK = 150          # website nhận tối đa 500 tin/lần; chia nhỏ cho nhẹ


def _env_from_file(key: str, app: str = "web") -> str:
    env_file = ROOT / app / ".env"
    if not env_file.exists():
        return ""
    for line in env_file.read_text(encoding="utf-8").splitlines():
        m = re.match(rf"\s*{key}\s*=\s*(.*)", line)
        if m:
            return m.group(1).strip().strip('"').strip("'")
    return ""


def config(cfg: dict) -> dict:
    c = cfg.get("website", {})
    return {
        "enabled": bool(c.get("enabled", True)),
        "url": (os.environ.get("WEB_URL") or c.get("url") or DEFAULT_URL).rstrip("/"),
        "token": os.environ.get("WEB_INGEST_TOKEN") or _env_from_file("INGEST_TOKEN"),
    }


def push_articles(items: list[dict], cfg: dict) -> int:
    """Gửi danh sách tin thô sang website. Trả về số bài được thêm mới."""
    conf = config(cfg)
    if not conf["enabled"]:
        return 0
    if not conf["token"]:
        log("⚠ website: chưa có INGEST_TOKEN (xem web/.env) — bỏ qua bước đẩy tin")
        return 0
    if not items:
        return 0

    added = skipped = 0
    for i in range(0, len(items), CHUNK):
        batch = items[i:i + CHUNK]
        payload = {
            "topic": cfg.get("topic", "showbiz"),
            "topic_name": cfg.get("topic_name"),
            "items": [{
                "title": it.get("title", "")[:500],
                "summary": it.get("summary") or None,
                "url": it.get("link") or None,
                "image": it.get("image") or None,
                "source": it.get("source") or None,
                "score": it.get("score"),
                "published": it.get("published"),
            } for it in batch if it.get("title")],
        }
        if not payload["items"]:
            continue

        req = urllib.request.Request(
            f"{conf['url']}/api/ingest/articles",
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers={"Content-Type": "application/json", "Accept": "application/json",
                     "X-Ingest-Token": conf["token"]},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                body = json.loads(resp.read().decode("utf-8"))
            added += body.get("added", 0)
            skipped += body.get("skipped", 0)
        except urllib.error.HTTPError as e:
            log(f"⚠ website: HTTP {e.code} — {e.read().decode('utf-8', 'replace')[:200]}")
            return added
        except Exception as e:
            log(f"⚠ website: không kết nối được {conf['url']} ({e})")
            return added

    log(f"✓ website: thêm {added} bài mới, bỏ qua {skipped} bài đã có")
    return added
