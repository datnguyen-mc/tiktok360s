"""Gọi mô hình ngôn ngữ để viết kịch bản — Gemini hoặc OpenAI.

Hai nhà cung cấp, một đầu ra: `sinh_json()` nhận prompt và trả về dict đã phân
tích. Phần khác nhau giữa hai bên — địa chỉ, cách đặt khoá, tên trường chứa kết
quả, cách yêu cầu JSON — nằm gọn trong file này, nên khâu viết kịch bản không
cần biết đang dùng bên nào.

Chọn bên nào: `series.provider` trong topics/<kênh>.json, hoặc `ai.provider`
trong config.json. Mặc định `gemini`.
"""
from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request

from .common import log

GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta"
OPENAI_BASE = "https://api.openai.com/v1"

MAC_DINH = {
    "gemini": "gemini-3.6-flash",
    # Đổi được qua `series.model` hoặc ô Model ở CMS → Cài đặt → OpenAI.
    "openai": "gpt-4o-mini",
}

TIMEOUT = 180

# USD cho mỗi 1 TRIỆU token, dạng (vào, ra).
#
# Giá do nhà cung cấp đặt và đổi theo thời gian, nên bảng này chỉ là mặc định —
# đối chiếu lại với trang giá của họ. Khai đè trong config.json:
#
#     "ai": { "gia": { "gpt-4o-mini": [0.15, 0.60] } }
#
# Model không có trong bảng thì vẫn ghi số token nhưng KHÔNG đoán thành tiền:
# một con số sai còn tệ hơn không có số nào.
GIA = {
    "gpt-4o-mini": (0.15, 0.60),
    "gpt-4o": (2.50, 10.00),
    "gemini-2.0-flash": (0.10, 0.40),
    "gemini-1.5-flash": (0.075, 0.30),
    "gemini-1.5-pro": (1.25, 5.00),
}

# Nhật ký các lần gọi trong một lượt chạy. run_daily đọc rồi gửi sang CMS.
_NHAT_KY: list[dict] = []


def nhat_ky() -> list[dict]:
    """Các lần gọi đã thực hiện, kèm token và thành tiền."""
    return list(_NHAT_KY)


def xoa_nhat_ky() -> None:
    _NHAT_KY.clear()


def _gia(model: str, cfg: dict) -> tuple[float, float] | None:
    bang = {**GIA, **((cfg.get("ai") or {}).get("gia") or {})}
    g = bang.get(model)
    if not g:
        # Tên model thường có hậu tố ngày tháng: gpt-4o-mini-2024-07-18.
        for ten, v in bang.items():
            if model.startswith(ten):
                g = v
                break
    return (float(g[0]), float(g[1])) if g else None


def _ghi_so(ncc: str, model: str, vao: int, ra: int, ms: int, cfg: dict,
            http: int = 200, loi: str = "") -> None:
    """Ghi một lần gọi vào nhật ký và in ra màn hình."""
    g = _gia(model, cfg)
    tien = None
    if g and (vao or ra):
        tien = round(vao / 1e6 * g[0] + ra / 1e6 * g[1], 6)

    _NHAT_KY.append({
        "provider": ncc, "model": model,
        "tokens_in": vao, "tokens_out": ra,
        "cost_usd": tien, "http_status": http, "duration_ms": ms,
        "status": "success" if http == 200 and not loi else "failed",
        "error_message": loi or None,
    })

    if not (vao or ra):
        return
    gia_text = f"${tien:.6f}".rstrip("0").rstrip(".") if tien is not None else "chưa khai giá"
    log(f"  ⛁ {ncc}/{model} · vào {vao:,} + ra {ra:,} = {vao + ra:,} token · {gia_text}")


def nha_cung_cap(cfg: dict) -> str:
    ncc = ((cfg.get("series") or {}).get("provider")
           or (cfg.get("ai") or {}).get("provider")
           or "gemini")
    ncc = str(ncc).lower().strip()
    if ncc not in MAC_DINH:
        log(f"  ⚠ không biết nhà cung cấp “{ncc}” — dùng gemini")
        return "gemini"
    return ncc


def ten_model(cfg: dict, ncc: str, tu_cms: dict | None = None) -> str:
    """CMS → topics/<kênh>.json → mặc định dựng sẵn.

    CMS đứng trước vì đó là chỗ đổi được mà không phải sửa file và deploy lại.
    """
    tu_cms = tu_cms or {}
    return (tu_cms.get(f"{ncc}_model")
            or (cfg.get("series") or {}).get("model")
            or MAC_DINH[ncc])


# ──────────────────────────────────────────────────────────────────────── khoá

def _tu_cms(cfg: dict, duong_dan: str) -> dict | None:
    from .cms import config as cms_config

    conf = cms_config(cfg)
    if not conf["enabled"] or not conf["token"]:
        return None
    try:
        req = urllib.request.Request(
            f"{conf['url']}{duong_dan}",
            headers={"X-Ingest-Token": conf["token"], "Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:                      # noqa: BLE001 — mạng ném đủ loại
        log(f"  ⚠ không hỏi được khoá từ CMS: {e}")
        return None


def api_key(cfg: dict, ncc: str, d: dict | None = None) -> str:
    """Khoá của nhà cung cấp đang dùng: CMS trước, rồi tới biến môi trường."""
    d = d if d is not None else (_tu_cms(cfg, "/api/pipeline/series-key") or {})

    if ncc == "openai":
        key = d.get("openai_key") or os.environ.get("OPENAI_API_KEY")
        if not key:
            raise RuntimeError(
                "Chưa có khoá OpenAI.\n"
                "  Khai ở CMS → Cài đặt → OpenAI, hoặc đặt biến môi trường "
                "OPENAI_API_KEY."
            )
        return key

    key = (d.get("key") or os.environ.get("GEMINI_API_KEY")
           or os.environ.get("GOOGLE_API_KEY"))
    if not key:
        raise RuntimeError(
            "Chưa có khoá Gemini.\n"
            "  Khai ở CMS → Cài đặt (ô “Khoá Gemini”), hoặc đặt biến môi trường "
            "GEMINI_API_KEY."
        )
    return key


# ───────────────────────────────────────────────────────────────────────── HTTP

def _che(url: str) -> str:
    """Che khoá nằm trong query string trước khi ghi log."""
    base, _, q = url.partition("?")
    if not q:
        return base
    return base + "?" + "&".join(
        (kv.split("=")[0] + "=***") if kv.split("=")[0] in ("key", "api_key") else kv
        for kv in q.split("&"))


def _post(url: str, body: dict, headers: dict, nhan: str) -> tuple[dict, int]:
    """Gửi một yêu cầu POST. Ghi log dù thành công hay thất bại.

    Khoá của OpenAI nằm ở header Authorization chứ không ở địa chỉ, nên ở đây
    chỉ ghi `url` và `nhan` — tuyệt đối không ghi `headers`.
    """
    data = json.dumps(body, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        url, data=data, method="POST",
        headers={"Content-Type": "application/json", "Accept": "application/json", **headers})

    hien = _che(url)
    t0 = time.monotonic()
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            raw = resp.read().decode("utf-8")
            ms = int((time.monotonic() - t0) * 1000)
            log(f"  ↯ {nhan} POST {hien} → {resp.status} · {ms} ms · {len(raw)} B")
            return json.loads(raw), ms
    except urllib.error.HTTPError as e:
        chi_tiet = e.read().decode("utf-8", "replace")[:500]
        ms = int((time.monotonic() - t0) * 1000)
        log(f"  ✗ {nhan} POST {hien} → {e.code} · {ms} ms · {chi_tiet}")
        raise RuntimeError(f"{nhan} trả về HTTP {e.code}: {chi_tiet}") from None
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        ms = int((time.monotonic() - t0) * 1000)
        log(f"  ✗ {nhan} POST {hien} → 0 · {ms} ms · {type(e).__name__}: {e}")
        raise RuntimeError(f"Không gọi được {nhan}: {e}") from None


# ──────────────────────────────────────────────────────────────────── sinh JSON

def _gemini(prompt: str, model: str, key: str, nhiet: float, toi_da: int) -> tuple[str, int, int, int]:
    d, ms = _post(
        f"{GEMINI_BASE}/models/{model}:generateContent?key={key}",
        {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": nhiet,
                "maxOutputTokens": toi_da,
                "responseMimeType": "application/json",
            },
        },
        {}, "gemini",
    )
    u = d.get("usageMetadata") or {}
    vao = int(u.get("promptTokenCount") or 0)
    # Phần "suy nghĩ" của model cũng tính tiền như token ra, nên phải cộng vào.
    ra = int(u.get("candidatesTokenCount") or 0) + int(u.get("thoughtsTokenCount") or 0)

    try:
        return d["candidates"][0]["content"]["parts"][0]["text"], vao, ra, ms
    except (KeyError, IndexError):
        ly_do = (d.get("promptFeedback") or {}).get("blockReason")
        raise RuntimeError(
            "Gemini không trả về nội dung"
            + (f" (bị chặn: {ly_do})" if ly_do else f": {json.dumps(d)[:300]}")
        ) from None


def _openai(prompt: str, model: str, key: str, nhiet: float, toi_da: int) -> tuple[str, int, int, int]:
    than = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        # Buộc trả JSON thuần. Thiếu cờ này model hay bọc kết quả trong ```json.
        "response_format": {"type": "json_object"},
        "temperature": nhiet,
        "max_completion_tokens": toi_da,
    }
    headers = {"Authorization": f"Bearer {key}"}

    try:
        d, ms = _post(f"{OPENAI_BASE}/chat/completions", than, headers, "openai")
    except RuntimeError as e:
        # Các đời model mới bỏ bớt tham số: đời o-series chỉ nhận temperature mặc
        # định, đời cũ lại chỉ hiểu `max_tokens`. Đọc đúng tên tham số bị than
        # phiền rồi bỏ nó ra, thay vì bắt người dùng tự đoán.
        loi = str(e)
        bo = [t for t in ("temperature", "max_completion_tokens") if f"'{t}'" in loi or f'"{t}"' in loi]
        if "max_tokens" in loi and "max_completion_tokens" in than:
            than["max_tokens"] = than.pop("max_completion_tokens")
            bo = bo or ["max_completion_tokens"]
        elif bo:
            for t in bo:
                than.pop(t, None)
        if not bo:
            raise
        log(f"  ↻ openai không nhận {', '.join(bo)} — gọi lại không kèm tham số đó")
        d, ms = _post(f"{OPENAI_BASE}/chat/completions", than, headers, "openai")

    u = d.get("usage") or {}
    vao = int(u.get("prompt_tokens") or 0)
    ra = int(u.get("completion_tokens") or 0)

    try:
        return d["choices"][0]["message"]["content"], vao, ra, ms
    except (KeyError, IndexError):
        raise RuntimeError(f"OpenAI không trả về nội dung: {json.dumps(d)[:300]}") from None


def sinh_json(prompt: str, cfg: dict, nhiet: float = 0.9, toi_da: int = 8192) -> tuple[str, str]:
    """Gọi model, trả về (chuỗi JSON thô, tên model đã dùng).

    Trả chuỗi thô chứ không phân tích sẵn: khâu gọi có hàm `_parse` riêng biết
    gỡ những kiểu bọc lạ mà model hay thêm vào.
    """
    ncc = nha_cung_cap(cfg)
    # Một lượt hỏi CMS dùng cho cả khoá lẫn tên model, thay vì hai vòng gọi.
    d = _tu_cms(cfg, "/api/pipeline/series-key") or {}
    model = ten_model(cfg, ncc, d)
    key = api_key(cfg, ncc, d)
    ham = _openai if ncc == "openai" else _gemini
    try:
        text, vao, ra, ms = ham(prompt, model, key, nhiet, toi_da)
    except RuntimeError as e:
        # Ghi cả lần hỏng: xem nhật ký mới biết tiền mất ở đâu, mà lần hỏng vẫn
        # có thể đã tính token.
        _ghi_so(ncc, model, 0, 0, 0, cfg, http=0, loi=str(e)[:300])
        raise
    _ghi_so(ncc, model, vao, ra, ms, cfg)
    return text, f"{ncc}:{model}"
