"""Logo câu lạc bộ cho cảnh mở đầu của kênh tư liệu.

Thứ tự tìm:

  1. assets/logos/<slug>.png — đặt tay, luôn được ưu tiên. Logo tự tìm bị sai
     thì thả file đúng vào đây, không phải sửa code.
  2. assets/logos/_auto/<slug>.png — bản đã tải về ở lần chạy trước.
  3. Wikipedia tiếng Anh: tìm trang "<tên> football club", lấy ảnh đại diện của
     trang. Với trang CLB, đó chính là logo trong hộp thông tin.

Không tìm được thì trả None — cảnh mở đầu vẫn dựng như cũ, chỉ thiếu logo.
"""
from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image

from .common import ROOT, log, slugify

DIR = ROOT / "assets" / "logos"
API = "https://en.wikipedia.org/w/api.php"
# Wikimedia chặn User-Agent giả trình duyệt; phải tự xưng tên công cụ.
UA = "tiktok360s-pipeline/1.0 (club logo lookup)"


def _get(url: str) -> bytes:
    """GET, thử lại một lần nếu bị giới hạn tần suất (429)."""
    for lan in range(2):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=20) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code != 429 or lan:
                raise
            time.sleep(5)
    raise RuntimeError("không tải được")


def _wikipedia(ten: str) -> tuple[str, str] | None:
    """(tên trang, link ảnh) — hoặc None nếu trang tìm được không có ảnh."""
    q = urllib.parse.urlencode({
        "action": "query", "format": "json", "formatversion": "2",
        "generator": "search", "gsrsearch": f"{ten} football club",
        "gsrlimit": "1", "gsrnamespace": "0",
        # Logo CLB trên Wikipedia gần như đều là ảnh không tự do, mà mặc định
        # API chỉ trả ảnh tự do — không xin "any" thì trang nào cũng trống.
        # Lấy thumbnail chứ không lấy bản gốc: bản gốc thường là SVG, Pillow
        # không mở được; thumbnail luôn là PNG.
        "prop": "pageimages", "piprop": "thumbnail", "pithumbsize": "600",
        "pilicense": "any",
    })
    pages = (json.loads(_get(f"{API}?{q}")).get("query") or {}).get("pages") or []
    if not pages or not (pages[0].get("thumbnail") or {}).get("source"):
        return None
    return pages[0].get("title", ""), pages[0]["thumbnail"]["source"]


def find(ten: str) -> Path | None:
    """Đường dẫn tới logo PNG của CLB, hoặc None."""
    if not ten:
        return None
    slug = slugify(ten)

    for p in (DIR / f"{slug}.png", DIR / "_auto" / f"{slug}.png"):
        if p.exists():
            return p

    try:
        found = _wikipedia(ten)
        if not found:
            log(f"⚠ không tìm thấy logo “{ten}” trên Wikipedia — "
                f"đặt tay vào assets/logos/{slug}.png")
            return None
        trang, url = found
        img = Image.open(BytesIO(_get(url))).convert("RGBA")
    except Exception as e:
        log(f"⚠ không tải được logo “{ten}”: {e}")
        return None

    dest = DIR / "_auto" / f"{slug}.png"
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest)
    # Ghi tên trang để soi được khi tìm nhầm đội (vd. ra trang thành phố)
    log(f"logo “{ten}” ← Wikipedia “{trang}” · {img.width}×{img.height}")
    return dest
