"""Tham số thời lượng, tự hiệu chỉnh theo lịch sử render.

Thời lượng video tuân theo mô hình tuyến tính hai tham số:

    phần đọc ≈ (số âm tiết / (r0 × hệ_số_tốc_độ)) + q × số_cảnh
    thời lượng ≈ phần đọc + khoảng lặng chuyển cảnh

  r0 = tốc độ đọc thuần ở rate +0% (âm tiết/giây)
  q  = quãng nghỉ TTS tự chèn ở đầu/cuối mỗi đoạn

Khớp trên **phần đọc** chứ không phải tổng thời lượng: khoảng lặng chuyển cảnh
co giãn theo độ dài cảnh (cảnh ngắn được giữ thêm cho kịp đọc), nên nếu gộp vào
sẽ làm nhiễu số liệu và hai tham số không tách ra được.

Hằng số cố định không dùng được lâu: đổi giọng, đổi rate, đổi số tin mỗi video
là mô hình lệch ngay. Nên sau mỗi lần render, kết quả thật được ghi lại vào
output/.timing.json, và tham số được khớp lại bằng bình phương tối thiểu.
Từ lần thứ hai trở đi, pipeline dùng số của chính nó thay vì số mặc định.
"""
from __future__ import annotations

import json
import re

from .common import ROOT

HISTORY = ROOT / "output" / ".timing.json"
MAX_SAMPLES = 40

SCENE_GAP = 0.28        # khoảng lặng tối thiểu giữa hai cảnh (tts.py dùng lại hằng số này)

# Mặc định ban đầu; sẽ được thay bằng số khớp từ chính các lần render của bạn.
DEFAULT = {"syl_per_sec_base": 3.60, "tts_pad": 0.35, "source": "mặc định"}

# Khoảng hợp lệ — kết quả khớp nằm ngoài đây là dữ liệu bẩn, bỏ qua.
VALID_RATE = (2.0, 7.0)
VALID_PAD = (0.0, 1.5)


def speed_factor(rate: str) -> float:
    """'+10%' -> 1.10"""
    pct = int(re.sub(r"[^0-9\-+]", "", rate or "") or 0)
    return max(0.5, 1 + pct / 100)


def _load() -> list[dict]:
    if not HISTORY.exists():
        return []
    try:
        return json.loads(HISTORY.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []


def record(voice_id: str, rate: str, syllables: int, scenes: int,
           speech: float, duration: float) -> None:
    """Ghi lại một lần render thật để lần sau ước lượng sát hơn.

    speech   = tổng thời lượng các đoạn đọc, chưa cộng khoảng lặng
    duration = thời lượng track hoàn chỉnh
    """
    samples = _load()
    samples.append({"voice": voice_id, "rate": rate, "syllables": syllables,
                    "scenes": scenes, "speech": round(speech, 3),
                    "duration": round(duration, 3)})
    HISTORY.parent.mkdir(parents=True, exist_ok=True)
    HISTORY.write_text(json.dumps(samples[-MAX_SAMPLES:], ensure_ascii=False, indent=2),
                       encoding="utf-8")


def params(voice_id: str) -> dict:
    """Tham số khớp từ lịch sử của đúng giọng này; thiếu dữ liệu thì dùng mặc định."""
    samples = [s for s in _load() if s["voice"] == voice_id]
    if len(samples) < 2:
        return dict(DEFAULT)

    # phần_đọc = a·x + q·n   với x = âm tiết / hệ_số_tốc_độ, n = số cảnh, a = 1/r0
    samples = [s for s in samples if "speech" in s]
    if len(samples) < 2:
        return dict(DEFAULT)

    # Tách được hai ẩn thì cần các mẫu khác nhau về SỐ CẢNH. Nếu mọi lần render đều
    # 12 cảnh thì cột "số cảnh" là hằng số: hệ vẫn giải ra nghiệm, nhưng nghiệm đó
    # chỉ là nhiễu được khuếch đại (đã gặp: ra 0.85s nghỉ mỗi đoạn, vô lý). Trường
    # hợp đó giữ nguyên q mặc định và chỉ khớp lại tốc độ đọc.
    if len({s["scenes"] for s in samples}) < 2:
        q = DEFAULT["tts_pad"]
        sxx = sxd = 0.0
        for s in samples:
            x = s["syllables"] / speed_factor(s["rate"])
            sxx += x * x
            sxd += x * (s["speech"] - q * s["scenes"])
        if sxx <= 0 or sxd <= 0:
            return dict(DEFAULT)
        r0 = sxx / sxd
        if not (VALID_RATE[0] <= r0 <= VALID_RATE[1]):
            return dict(DEFAULT)
        return {"syl_per_sec_base": round(r0, 3), "tts_pad": q,
                "source": f"khớp tốc độ từ {len(samples)} lần render (mọi lần cùng số cảnh)"}

    sxx = sxn = snn = sxd = snd = 0.0
    for s in samples:
        x = s["syllables"] / speed_factor(s["rate"])
        n, d = s["scenes"], s["speech"]
        sxx += x * x; sxn += x * n; snn += n * n; sxd += x * d; snd += n * d

    det = sxx * snn - sxn * sxn
    if abs(det) < 1e-9:
        return dict(DEFAULT)                 # các mẫu quá giống nhau, chưa tách được 2 ẩn

    a = (snn * sxd - sxn * snd) / det
    p = (sxx * snd - sxn * sxd) / det
    if a <= 0:
        return dict(DEFAULT)
    r0 = 1 / a
    if not (VALID_RATE[0] <= r0 <= VALID_RATE[1] and VALID_PAD[0] <= p <= VALID_PAD[1]):
        return dict(DEFAULT)

    return {"syl_per_sec_base": round(r0, 3), "tts_pad": round(p, 3),
            "source": f"khớp từ {len(samples)} lần render"}


def estimate(syllables: int, scenes: int, rate: str, prm: dict) -> float:
    """Ước lượng thời lượng video theo tham số đang dùng.

    Chưa tính phần giữ thêm cho cảnh ngắn — phần đó chỉ phát sinh khi kịch bản
    ngắn, tức là lúc video đang có nguy cơ hụt khung dưới, nên nó kéo về đúng hướng.
    """
    return (syllables / (prm["syl_per_sec_base"] * speed_factor(rate))
            + prm["tts_pad"] * scenes
            + SCENE_GAP * max(0, scenes - 1))
