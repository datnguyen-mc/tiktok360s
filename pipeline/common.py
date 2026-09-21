"""Tiện ích dùng chung: nạp cấu hình, xử lý text tiếng Việt, đo độ dài đọc."""
from __future__ import annotations

import html
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def load_config(path: str | Path | None = None, topic: str | None = None) -> dict:
    """Nạp cấu hình chung, rồi phủ cấu hình của chủ đề lên trên.

    topic=None thì lấy chủ đề khai trong config.json (mặc định "showbiz").
    """
    cfg_path = Path(path) if path else ROOT / "config.json"
    cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
    cfg["_root"] = str(ROOT)

    # nhập tại chỗ: topics.py cần ROOT từ chính file này
    from .topics import load as load_topic

    return load_topic(topic, cfg)


def rel(path: str) -> Path:
    """Đường dẫn tương đối so với gốc project."""
    p = Path(path)
    return p if p.is_absolute() else ROOT / p


# ---------------------------------------------------------------- text utils

_TAG_RE = re.compile(r"<[^>]+>")
_WS_RE = re.compile(r"\s+")
_EMOJI_RE = re.compile(
    "[\U0001F300-\U0001FAFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF←-⇿⬀-⯿]+"
)


def strip_html(text: str) -> str:
    text = _TAG_RE.sub(" ", text or "")
    text = html.unescape(text)
    return _WS_RE.sub(" ", text).strip()


# "(Dân trí)", "TPO - ", "TTO - ", "(PLO)- " ... ở đầu sapo là dấu vết toà soạn,
# đọc lên nghe rất kỳ nên cắt bỏ trước khi đưa vào lời đọc.
_LEAD_RE = re.compile(
    r"^\s*(?:\([^)]{1,24}\)|TPO|TTO|PLO|VOV|VTC News|Dân trí|Báo [A-ZĐ][\w\s]{1,20})"
    r"\s*[-–—:,]*\s*", re.IGNORECASE)


def strip_lead(text: str) -> str:
    """Bỏ tiền tố toà soạn ở đầu câu."""
    out = _LEAD_RE.sub("", text or "", count=1)
    return out.strip() or (text or "").strip()


def strip_emoji(text: str) -> str:
    return _WS_RE.sub(" ", _EMOJI_RE.sub("", text or "")).strip()


def no_accent(text: str) -> str:
    """Bỏ dấu — chỉ dùng để so khớp trùng lặp, không dùng để hiển thị."""
    text = unicodedata.normalize("NFD", text or "")
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    return text.replace("đ", "d").replace("Đ", "D")


def slugify(text: str, max_len: int = 60) -> str:
    s = no_accent(text).lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:max_len].strip("-") or "video"


# Viết tắt / ký hiệu -> dạng đọc được, để giọng TTS không vấp.
_SPOKEN = [
    (r"\bTP\.?\s?HCM\b", "Thành phố Hồ Chí Minh"),
    (r"\bTP\.?\s?HN\b", "Hà Nội"),
    (r"\bMV\b", "em vi"),
    (r"\bMC\b", "em xi"),
    (r"\bCEO\b", "xi i âu"),
    (r"\bOST\b", "ô ét ti"),
    (r"\bNSND\b", "Nghệ sĩ Nhân dân"),
    (r"\bNSƯT\b", "Nghệ sĩ Ưu tú"),
    (r"\bH'?Hen\b", "Hơ Hen"),
    (r"\bvs\.?\b", "và"),
    (r"&", " và "),
    (r"%", " phần trăm"),
    (r"\+", " cộng "),
    (r"\bUS\$|\bUSD\b", " đô la "),
    (r"\bVNĐ\b|\bVND\b", " đồng "),
    (r"\btr\b", " triệu "),
    (r"…", "."),
    (r"[“”\"«»]", ""),
    (r"[‘’]", "'"),
    (r"\s+[-–—]\s+", ", "),   # chỉ gạch ngang tách mệnh đề, giữ nguyên "M-TP"
    (r"\s*\|\s*", ", "),
    (r"\(\s*\)", ""),
]


def to_spoken(text: str) -> str:
    """Chuẩn hoá câu cho TTS đọc trôi chảy."""
    s = strip_emoji(strip_html(text))
    for pat, rep in _SPOKEN:
        s = re.sub(pat, rep, s, flags=re.IGNORECASE)
    s = re.sub(r"\s*,\s*,+", ", ", s)
    s = re.sub(r"\s+([,.!?])", r"\1", s)
    s = _WS_RE.sub(" ", s).strip(" ,;:")
    if s and s[-1] not in ".!?":
        s += "."
    return capitalize_sentences(s)


def capitalize_sentences(text: str) -> str:
    """Viết hoa đầu câu — cần thiết khi ghép mẫu câu có chỗ điền ở giữa."""
    out = list(text or "")
    upper_next = True
    for i, ch in enumerate(out):
        if upper_next and ch.isalpha():
            out[i] = ch.upper()
            upper_next = False
        elif ch in ".!?":
            upper_next = True
    return "".join(out)


def syllables(text: str) -> int:
    """Tiếng Việt: mỗi 'từ' cách nhau bởi khoảng trắng ~ 1 âm tiết."""
    return len([w for w in re.split(r"\s+", strip_emoji(text)) if re.search(r"\w", w)])


def est_seconds(text: str, syl_per_sec: float = 3.80) -> float:
    """Ước lượng thời lượng đọc thuần, chưa tính khoảng lặng giữa các cảnh.

    3.80 âm tiết/giây là số đo thực của vi-VN-HoaiMyNeural ở rate +10%.
    Bên gọi phải cộng thêm SCENE_PAD cho mỗi cảnh (xem script_builder), vì
    video 12 cảnh có gấp đôi khoảng lặng so với video 6 cảnh cùng số chữ.
    Đổi giọng hoặc đổi rate mặc định thì đo lại bằng: make calibrate
    """
    return syllables(text) / syl_per_sec


def shorten(text: str, max_chars: int) -> str:
    """Cắt gọn theo ranh giới từ, không cắt giữa chữ."""
    text = (text or "").strip()
    if len(text) <= max_chars:
        return text
    cut = text[:max_chars].rsplit(" ", 1)[0]
    return cut.rstrip(" ,.;:-–—") + "…"


def trim_clause(text: str, min_syllables: int = 6) -> str | None:
    """Bỏ mệnh đề phụ cuối câu để rút ngắn lời đọc mà vẫn giữ trọn ý chính.

    Tiêu đề báo tiếng Việt hay có dạng "Ý chính, chi tiết phụ" — cắt ở dấu phẩy
    cuối cùng giữ được thông tin cốt lõi. Trả về None khi không rút ngắn thêm được.
    """
    body = (text or "").strip().rstrip(".!?")
    for sep in (",", ";", ":"):
        head = body.rsplit(sep, 1)[0].strip()
        if head != body and syllables(head) >= min_syllables:
            return head + "."
    words = body.split()
    if len(words) > min_syllables + 2:            # không còn dấu phẩy: bỏ bớt đuôi
        return " ".join(words[:-2]).rstrip(" ,;:-–—") + "."
    return None


def sentences(text: str) -> list[str]:
    """Tách câu tiếng Việt, bỏ mảnh vụn quá ngắn (thường là chú thích ảnh)."""
    text = _WS_RE.sub(" ", (text or "").strip())
    parts = re.split(r"(?<=[.!?])\s+(?=[A-ZĐÀ-Ỹ0-9\"'])", text)
    out = []
    for p in parts:
        p = p.strip(" ,;:-–—")
        if syllables(p) >= 4:
            out.append(p if p[-1] in ".!?" else p + ".")
    return out


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    v = value.lstrip("#")
    return tuple(int(v[i:i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def log(msg: str) -> None:
    print(f"  {msg}", flush=True)


def step(msg: str) -> None:
    print(f"\n▶ {msg}", flush=True)
