"""Chủ đề kênh: mỗi chủ đề là một file JSON trong thư mục topics/.

config.json giữ những thứ dùng chung cho mọi kênh (kích thước video, giọng đọc,
phụ đề, nhạc, kết nối CMS). Những thứ riêng của từng chủ đề — nguồn tin, từ khoá
xếp hạng, nhận diện, hashtag, và toàn bộ giọng văn — nằm trong topics/<slug>.json.

Thêm một chủ đề mới = thêm một file JSON, không phải sửa code.

    make video TOPIC=bongda
    .venv/bin/python -m pipeline.run_daily --topic bongda
"""
from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

from .common import ROOT

TOPICS_DIR = ROOT / "topics"
DEFAULT_TOPIC = "showbiz"


def _deep_merge(base: dict, over: dict) -> dict:
    """Gộp cấu hình: khoá trùng thì chủ đề thắng, dict thì gộp sâu.

    Danh sách bị THAY THẾ hẳn chứ không nối thêm — nguồn tin và từ khoá của
    bóng đá không liên quan gì tới showbiz, nối vào chỉ tổ lẫn lộn.
    """
    out = deepcopy(base)
    for key, value in over.items():
        if isinstance(value, dict) and isinstance(out.get(key), dict):
            out[key] = _deep_merge(out[key], value)
        else:
            out[key] = deepcopy(value)
    return out


def available() -> list[str]:
    if not TOPICS_DIR.is_dir():
        return []
    return sorted(p.stem for p in TOPICS_DIR.glob("*.json"))


def load(slug: str | None, base: dict) -> dict:
    """Trả về cấu hình đã gộp cho một chủ đề."""
    slug = slug or base.get("topic") or DEFAULT_TOPIC
    path = TOPICS_DIR / f"{slug}.json"

    if not path.exists():
        found = available()
        raise SystemExit(
            f"Không có chủ đề {slug!r}.\n"
            f"  Các chủ đề hiện có: {', '.join(found) or '(chưa có file nào trong topics/)'}\n"
            f"  Thêm chủ đề mới: tạo topics/{slug}.json"
        )

    topic = json.loads(path.read_text(encoding="utf-8"))
    cfg = _deep_merge(base, topic)
    cfg["topic"] = slug
    cfg["topic_name"] = topic.get("name", slug)
    return cfg


def output_dir(cfg: dict, date: str) -> Path:
    """output/<chủ đề>/<ngày>/ — mỗi chủ đề một nhánh riêng, khỏi lẫn."""
    return ROOT / "output" / cfg.get("topic", DEFAULT_TOPIC) / date
