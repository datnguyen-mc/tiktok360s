"""Theo dõi từng bước của một lần dựng video.

Mỗi bước được đẩy lên CMS NGAY khi xong, không đợi tới cuối. Nhờ vậy:
  · mở CMS lúc dây chuyền đang chạy thì thấy nó đang ở bước nào
  · hỏng thì biết hỏng ở bước nào, mất bao lâu, và vì sao

CMS tắt hay mạng hỏng cũng không sao — mọi lỗi gửi đều bị nuốt, dây chuyền chạy tiếp.
Bản ghi vẫn còn đủ trong log của tiến trình.
"""
from __future__ import annotations

import json
import time
import urllib.error
import urllib.request
from contextlib import contextmanager
from datetime import datetime

from .cms import config as cms_config
from .common import log

# Tên bước hiển thị trong CMS. Thứ tự này quyết định thứ tự trên dòng thời gian.
BUOC = {
    "fetch":   "Thu thập tin",
    "website": "Đẩy tin sang website",
    "script":  "Dựng kịch bản",
    "aiclip":  "Sinh cảnh bằng AI",
    "tts":     "Sinh giọng đọc",
    "visuals": "Dựng hình",
    "render":  "Ghép video",
    "upload":  "Tải lên R2",
    "publish": "Lưu kết quả",
}


class StepTracker:
    """Đo thời gian và báo cáo từng bước."""

    def __init__(self, cfg: dict, run_date: str, enabled: bool = True):
        self.cfg = cfg
        self.topic = cfg.get("topic", "showbiz")
        self.run_date = run_date
        self.enabled = enabled
        self.seq = 0
        self.history: list[dict] = []

    @contextmanager
    def step(self, key: str, label: str | None = None):
        """Bọc một bước. Ghi nhận thời gian, kết quả, và lỗi nếu có.

        Dùng:
            with tracker.step("tts") as s:
                ...
                s.note("56.4s · 200 chữ", words=200)
        """
        self.seq += 1
        seq = self.seq
        label = label or BUOC.get(key, key)
        started = datetime.now()
        t0 = time.monotonic()

        box = _StepBox()
        self._send(seq, key, label, "running", started=started)

        try:
            yield box
        except Exception as e:
            self._send(seq, key, label, "failed", started=started, t0=t0,
                       detail=f"{type(e).__name__}: {e}"[:1000], meta=box.meta)
            raise
        else:
            self._send(seq, key, label, "done", started=started, t0=t0,
                       detail=box.detail, meta=box.meta)

    def _send(self, seq, key, label, status, *, started, t0=None, detail=None, meta=None):
        payload = {
            "topic": self.topic,
            "run_date": self.run_date,
            "sequence": seq,
            "step": key,
            "label": label,
            "status": status,
            "started_at": started.isoformat(timespec="seconds"),
        }
        if t0 is not None:
            ms = int((time.monotonic() - t0) * 1000)
            payload["duration_ms"] = ms
            payload["finished_at"] = datetime.now().isoformat(timespec="seconds")
        if detail:
            payload["detail"] = detail
        if meta:
            payload["meta"] = meta

        if status != "running":
            self.history.append(payload)
            secs = payload.get("duration_ms", 0) / 1000
            mark = "✓" if status == "done" else "✗"
            log(f"{mark} {label} · {secs:.1f}s" + (f" · {detail}" if detail else ""))

        if self.enabled:
            self._post(payload)

    def _post(self, payload: dict) -> None:
        conf = cms_config(self.cfg)
        if not conf["enabled"] or not conf["token"]:
            return
        req = urllib.request.Request(
            f"{conf['url']}/api/ingest/step",
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers={"Content-Type": "application/json", "Accept": "application/json",
                     "X-Ingest-Token": conf["token"]},
            method="POST",
        )
        try:
            urllib.request.urlopen(req, timeout=8).read()
        except (urllib.error.URLError, OSError, TimeoutError):
            # CMS hỏng thì thôi, không để nó chặn việc dựng video
            pass


class _StepBox:
    """Chỗ để thân bước ghi lại kết quả tóm tắt."""

    def __init__(self):
        self.detail: str | None = None
        self.meta: dict = {}

    def note(self, detail: str, **meta) -> None:
        self.detail = detail
        self.meta.update(meta)
