"""B1 — Thu thập tin showbiz từ RSS, lọc trùng, chấm điểm độ 'hot'."""
from __future__ import annotations

import argparse
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import date as date_cls
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

from .common import (ROOT, chua_cum, load_config, log, no_accent, sentences, shorten,
                     step, strip_html, strip_lead)

VN_TZ = timezone(timedelta(hours=7))     # tin showbiz Việt — gom theo ngày giờ Việt Nam

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36"
NS = {"media": "http://search.yahoo.com/mrss/", "content": "http://purl.org/rss/1.0/modules/content/"}
IMG_RE = re.compile(r'<img[^>]+src=["\']([^"\']+)["\']', re.I)


def _get(url: str, timeout: int = 20) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def _text(node, tag: str) -> str:
    el = node.find(tag)
    return (el.text or "").strip() if el is not None and el.text else ""


def _image_of(item) -> str:
    enc = item.find("enclosure")
    if enc is not None and "image" in (enc.get("type") or "") and enc.get("url"):
        return enc.get("url")
    for path in ("media:content", "media:thumbnail"):
        el = item.find(path, NS)
        if el is not None and el.get("url"):
            return el.get("url")
    raw = _text(item, "description") + _text(item, "{http://purl.org/rss/1.0/modules/content/}encoded")
    m = IMG_RE.search(raw)
    return m.group(1) if m else ""


def _published(item) -> datetime:
    for tag in ("pubDate", "published", "updated"):
        raw = _text(item, tag)
        if not raw:
            continue
        try:
            dt = parsedate_to_datetime(raw)
            return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
        except Exception:
            try:
                return datetime.fromisoformat(raw.replace("Z", "+00:00"))
            except Exception:
                continue
    return datetime.now(timezone.utc)


def fetch_source(src: dict, max_age_hours: int) -> list[dict]:
    """Đọc 1 feed RSS -> danh sách tin đã chuẩn hoá."""
    try:
        root = ET.fromstring(_get(src["url"]))
    except Exception as exc:  # feed lỗi thì bỏ qua, không làm hỏng cả run
        log(f"✗ {src['name']}: {exc}")
        return []

    cutoff = datetime.now(timezone.utc) - timedelta(hours=max_age_hours)
    out: list[dict] = []
    for item in root.iter("item"):
        title = strip_lead(strip_html(_text(item, "title")))
        link = _text(item, "link")
        if not title or not link:
            continue
        published = _published(item)
        if published < cutoff:
            continue
        out.append({
            "title": title,
            "link": link,
            "summary": strip_lead(strip_html(_text(item, "description"))),
            "image": _image_of(item),
            "published": published.isoformat(),
            "source": src["name"],
            "weight": float(src.get("weight", 1.0)),
        })
    log(f"✓ {src['name']}: {len(out)} tin trong {max_age_hours}h")
    return out


# ----------------------------------------------------------------- lọc & xếp

def _key(title: str) -> set[str]:
    words = re.findall(r"[a-z0-9]+", no_accent(title).lower())
    return {w for w in words if len(w) > 2}


def dedupe(items: list[dict], threshold: float = 0.55) -> list[dict]:
    """Bỏ tin trùng nội dung giữa các báo (so khớp tập từ khoá tiêu đề)."""
    kept: list[dict] = []
    keys: list[set[str]] = []
    for it in items:
        k = _key(it["title"])
        if not k:
            continue
        if any(len(k & prev) / max(1, min(len(k), len(prev))) >= threshold for prev in keys):
            continue
        kept.append(it)
        keys.append(k)
    return kept


# Hai chữ trở lên viết hoa liên tiếp, toàn ký tự ASCII, không dấu tiếng Việt
_TEN_NGOAI = re.compile(r"\b[A-Z][a-z]{1,}(?:\s+[A-Z][a-z]{1,}){1,}\b")

# Những cụm hai chữ hoa hay gặp trong tin tiếng Việt mà KHÔNG phải tên người
_BO_QUA = {
    "Viet Nam", "Ha Noi", "Sai Gon", "Premier League", "Champions League",
    "Europa League", "Nations League", "World Cup", "La Liga", "Serie A",
    "The Voice", "The Face", "The Scandal", "Rap Viet", "Running Man",
    "An Cung", "Thu Duc", "Binh Duong", "Can Tho", "Da Nang", "Nha Trang",
}


def _foreign_names(title: str) -> int:
    """Đếm số cụm tên riêng nước ngoài trong tiêu đề."""
    return sum(1 for m in _TEN_NGOAI.findall(title) if m not in _BO_QUA)


def score(item: dict, cfg: dict) -> float:
    rank = cfg["ranking"]
    title_l = item["title"].lower()
    text_l = (item["title"] + " " + item["summary"]).lower()

    s = 10.0 * item["weight"]
    s += 3.0 * sum(1 for k in rank["hot_keywords"] if chua_cum(title_l, k))
    s += 1.0 * sum(1 for k in rank["hot_keywords"]
                   if chua_cum(text_l, k) and not chua_cum(title_l, k))

    # Tên riêng nước ngoài: "Selena Gomez", "Ji Chang Wook", "Taylor Swift" —
    # hai chữ hoa liền nhau, không dấu. Chữ Việt gần như luôn có dấu ở đâu đó,
    # nên đây là dấu hiệu rẻ mà khá chắc để nhận ra tin về sao ngoại.
    #
    # Là suy đoán chứ không phải sự thật: "Sơn Tùng M-TP" hay "Quang Hải" viết
    # không dấu vẫn lọt. Nên nó chỉ TRỪ ĐIỂM, không loại bỏ — tin ngoại thật sự
    # nổi bật vẫn lên được.
    if rank.get("phat_ten_ngoai"):
        s -= float(rank["phat_ten_ngoai"]) * _foreign_names(item["title"])

    # Ưu tiên theo nhóm: cách nói "chủ yếu là X" bằng điểm thay vì bằng bộ lọc.
    # Lọc cứng thì mất hẳn phần còn lại; cộng/trừ điểm thì X luôn nổi lên trên
    # mà vẫn còn chỗ cho tin ngoài X khi nó thật sự nổi bật.
    for group in rank.get("prefer_keywords") or []:
        bonus = float(group.get("bonus", 0))
        if any(chua_cum(text_l, k) for k in group.get("keywords") or []):
            s += bonus
    if item["image"]:
        s += 4.0
    # càng mới càng ưu tiên: trừ dần theo giờ
    age_h = (datetime.now(timezone.utc) - datetime.fromisoformat(item["published"])).total_seconds() / 3600
    s -= age_h * 0.35
    # tiêu đề quá dài khó lên chữ trên màn dọc
    s -= max(0, len(item["title"]) - 90) * 0.08
    return s


def is_blocked(item: dict, cfg: dict) -> bool:
    """Chặn tin tang thương / nhạy cảm — không hợp định dạng tin nhanh."""
    text_l = (item["title"] + " " + item["summary"]).lower()
    return any(chua_cum(text_l, k) for k in cfg["ranking"]["block_keywords"])


def matches_topic(item: dict, cfg: dict) -> bool:
    """Tin có đúng chủ đề không.

    Cần thiết khi chủ đề không có feed riêng. Bóng đá là ví dụ: các báo chỉ có
    feed "thể thao" chung, trong đó khoảng một nửa là bóng đá, phần còn lại là
    bóng chuyền, điền kinh, cờ vua… nên phải lọc bằng từ khoá.

    require_keywords rỗng nghĩa là nhận tất cả (showbiz có feed riêng nên không cần).
    exclude_keywords được xét TRƯỚC, vì "đội tuyển bóng chuyền" khớp cả hai bên.
    """
    rank = cfg.get("ranking", {})
    require = rank.get("require_keywords") or []
    strong = rank.get("require_strong_keywords") or []
    exclude = rank.get("exclude_keywords") or []
    text_l = (item["title"] + " " + item["summary"]).lower()

    if any(chua_cum(text_l, k) for k in exclude):
        return False

    # Từ khoá "chắc chắn đúng chủ đề". Có khai thì bắt buộc phải khớp một cái.
    #
    # Cần lớp này vì `require_keywords` chứa những từ quá chung để đứng một
    # mình: "đội tuyển" khớp cả đội tuyển cầu mây, đội tuyển bắn súng và đội
    # tuyển PUBG — ba thứ không liên quan gì tới bóng đá. Một từ chắc chắn như
    # "bóng đá" hay "ngoại hạng" thì không nhầm được.
    if strong:
        return any(chua_cum(text_l, k) for k in strong)

    if not require:
        return True
    return any(chua_cum(text_l, k) for k in require)


def _parse_date(value: str) -> date_cls:
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        raise ValueError(f"Ngày không hợp lệ: {value!r} — dùng định dạng YYYY-MM-DD")


def _window_hours(target: date_cls | None, default_hours: int) -> int:
    """Cửa sổ tải RSS đủ rộng để chạm tới ngày cần lấy."""
    if target is None:
        return default_hours
    now_vn = datetime.now(VN_TZ)
    end_of_day = datetime.combine(target, datetime.max.time(), tzinfo=VN_TZ)
    hours = (now_vn - min(now_vn, end_of_day)).total_seconds() / 3600 + 26
    return max(default_hours, int(hours) + 1)


def collect(cfg: dict, date: str | None = None) -> list[dict]:
    """Tin để làm video: đã lọc trùng, xếp hạng và cân đều giữa các báo."""
    items = collect_all(cfg, date)

    # Không để một báo chiếm hết video. Bước này CHỈ dành cho video — website
    # nhận toàn bộ tin qua collect_all(), vì trang tin càng nhiều bài càng tốt.
    per_source: dict[str, int] = {}
    picked: list[dict] = []
    for it in items:
        n = per_source.get(it["source"], 0)
        if n >= cfg["ranking"]["max_per_source"]:
            continue
        per_source[it["source"]] = n + 1
        picked.append(it)

    need = cfg["script"].get("min_items_per_video", cfg["script"]["items_per_video"])
    log(f"→ còn {len(picked)} tin sau khi lọc trùng & cân nguồn (cần tối thiểu {need})")
    if len(picked) < need:
        log(f"⚠ thiếu {need - len(picked)} tin — nới max_per_source hoặc thêm nguồn trong config.json")
    return picked


def collect_all(cfg: dict, date: str | None = None) -> list[dict]:
    """Toàn bộ tin đúng chủ đề, đã lọc trùng và xếp hạng — CHƯA cắt theo báo.

    date=None nghĩa là tin mới nhất; đưa YYYY-MM-DD để lấy đúng ngày đó.
    """
    target = _parse_date(date) if date else None
    today_vn = datetime.now(VN_TZ).date()
    if target == today_vn:
        target = None                        # hôm nay thì cứ lấy tin mới nhất cho tự nhiên

    step("B1 · Thu thập tin showbiz" + (f" · ngày {target}" if target else ""))

    # Báo ngay ở đây thay vì để bước dựng kịch bản chết vì danh sách rỗng: lỗi
    # càng gần nguyên nhân thì càng dễ sửa.
    if not cfg.get("sources"):
        raise RuntimeError(
            f"Chủ đề “{cfg.get('topic_name') or cfg.get('topic')}” chưa khai nguồn RSS nào.\n"
            f"  Thêm vào topics/{cfg.get('topic', '?')}.json, mục `sources`, "
            f"hoặc sửa trong CMS ở trang Chủ đề kênh."
        )

    window = _window_hours(target, cfg["script"]["max_age_hours"])
    raw: list[dict] = []
    for src in cfg["sources"]:
        raw += fetch_source(src, window)

    if target is not None:
        before = len(raw)
        raw = [i for i in raw
               if datetime.fromisoformat(i["published"]).astimezone(VN_TZ).date() == target]
        log(f"lọc theo ngày {target}: {before} → {len(raw)} tin")
        if not raw:
            raise RuntimeError(
                f"Không có tin nào đăng ngày {target} trong RSS.\n"
                f"  RSS chỉ giữ tin vài ngày gần nhất — ngày càng cũ càng khó lấy.\n"
                f"  Hôm nay (giờ VN) là {today_vn}."
            )

    before = len(raw)
    raw = [i for i in raw if matches_topic(i, cfg)]
    if len(raw) != before:
        log(f"lọc đúng chủ đề {cfg.get('topic_name', '')}: {before} → {len(raw)} tin")

    raw = [i for i in raw if not is_blocked(i, cfg)]
    raw.sort(key=lambda i: i["published"], reverse=True)
    items = dedupe(raw)
    for it in items:
        it["score"] = round(score(it, cfg), 2)
    items.sort(key=lambda i: i["score"], reverse=True)

    for it in items:
        # headline = bản rút gọn để hiển thị trên màn hình; title đầy đủ vẫn giữ để đọc
        it["headline"] = shorten(it["title"], cfg["script"]["headline_max_chars"])
        it["sentences"] = sentences(it["summary"])

    log(f"→ {len(items)} tin sau khi lọc trùng")
    return items


def main() -> None:
    ap = argparse.ArgumentParser(description="Thu thập tin showbiz từ RSS")
    ap.add_argument("--out", default="", help="file JSON đầu ra")
    ap.add_argument("--limit", type=int, default=20)
    ap.add_argument("--topic", default="", help="chủ đề kênh")
    ap.add_argument("--date", default="", help="YYYY-MM-DD theo giờ VN (mặc định: tin mới nhất)")
    args = ap.parse_args()

    cfg = load_config(topic=args.topic or None)
    items = collect(cfg, args.date or None)[: args.limit]
    out = Path(args.out) if args.out else ROOT / "output" / cfg["topic"] / "news.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    log(f"→ {out}")
    for i, it in enumerate(items[:10], 1):
        print(f"   {i:>2}. [{it['score']:>5}] {it['source']:<10} {it['headline']}")


if __name__ == "__main__":
    main()
