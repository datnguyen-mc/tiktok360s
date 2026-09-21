"""B4 — Dựng hình bằng Pillow: nền mờ, thẻ ảnh, tiêu đề, phụ đề karaoke.

Mỗi cảnh cho ra 2 file:
  bg_N.jpg  — nền full-bleed đã làm mờ + tối (ffmpeg sẽ zoom chậm lớp này)
  ui_N.png  — lớp trong suốt chứa thẻ ảnh, tiêu đề, badge (đứng yên, chữ nét)
Phụ đề được render riêng thành từng "trạng thái" ứng với mỗi chữ được tô sáng.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

from .common import ROOT, hex_to_rgb, load_config, log, rel, step

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36"

W, H = 1080, 1920
MARGIN = 90                      # lề trái/phải cho khối nội dung
CARD_TOP, CARD_H = 330, 680      # thẻ ảnh tin
HEADLINE_TOP = 1058
CAPTION_TOP = 1368
PROGRESS_Y = 1690

FONTS = {
    "head": "assets/fonts/BeVietnamPro-ExtraBold.ttf",
    "body": "assets/fonts/BeVietnamPro-SemiBold.ttf",
    "cap":  "assets/fonts/BeVietnamPro-ExtraBold.ttf",
}


def font(kind: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(rel(FONTS[kind])), size)


# --------------------------------------------------------------- tải ảnh tin

def upgrade_url(url: str) -> str:
    """Nâng độ phân giải ảnh từ link thumbnail của các báo."""
    if not url:
        return url
    for token in ("/zoom/600_315", "/zoom/700_438", "/zoom/480_300"):
        url = url.replace(token, "")
    url = url.replace("photo.znews.vn/w660/", "photo.znews.vn/w1920/")
    url = url.replace("/thumb_w/1200/", "/thumb_w/1600/")
    if "vnecdn.net" in url and "w=" in url:
        url = url.replace("w=1200", "w=1600")
    return url


def download(url: str, cache: Path) -> Path | None:
    if not url:
        return None
    cache.mkdir(parents=True, exist_ok=True)
    for candidate in (upgrade_url(url), url):
        name = hashlib.sha1(candidate.encode()).hexdigest()[:16] + ".img"
        dest = cache / name
        if dest.exists() and dest.stat().st_size > 8000:
            return dest
        try:
            req = urllib.request.Request(candidate, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=20) as r:
                data = r.read()
            if len(data) < 8000:
                continue
            dest.write_bytes(data)
            Image.open(dest).verify()          # loại file hỏng / không phải ảnh
            return dest
        except Exception:
            continue
    return None


def cover(img: Image.Image, w: int, h: int) -> Image.Image:
    """Phóng ảnh phủ kín khung rồi cắt giữa (ưu tiên phần trên — thường là mặt)."""
    img = img.convert("RGB")
    scale = max(w / img.width, h / img.height)
    img = img.resize((max(1, round(img.width * scale)), max(1, round(img.height * scale))),
                     Image.LANCZOS)
    left = (img.width - w) // 2
    top = int((img.height - h) * 0.32)         # lệch lên trên cho hợp ảnh chân dung
    return img.crop((left, top, left + w, top + h))


# ------------------------------------------------------------------ vẽ nền

def gradient(top: tuple[int, int, int], bottom: tuple[int, int, int], w=W, h=H) -> Image.Image:
    base = Image.new("RGB", (1, h))
    px = base.load()
    for y in range(h):
        t = y / (h - 1)
        px[0, y] = tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
    return base.resize((w, h), Image.BILINEAR)


def make_background(photo: Path | None, cfg: dict) -> Image.Image:
    accent = hex_to_rgb(cfg["brand"]["accent"])
    if photo is None:
        base = gradient((18, 10, 30), (max(0, accent[0] // 3), 8, 46))
    else:
        base = cover(Image.open(photo), W, H).filter(ImageFilter.GaussianBlur(42))
    dark = Image.new("RGB", (W, H), (0, 0, 0))
    base = Image.blend(base, dark, 0.58)
    # vệt sáng accent ở đáy cho có chiều sâu
    glow = Image.new("RGB", (W, H), (0, 0, 0))
    ImageDraw.Draw(glow).ellipse((-260, H - 620, W + 260, H + 320), fill=accent)
    glow = glow.filter(ImageFilter.GaussianBlur(120))    # tránh lộ viền ellipse
    return Image.blend(base, glow, 0.16)


# ------------------------------------------------------------ tiện ích vẽ chữ

def wrap(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont,
         max_w: int, max_lines: int) -> list[str]:
    lines: list[str] = []
    for para in text.split("\n"):
        words, cur = para.split(), ""
        for word in words:
            trial = f"{cur} {word}".strip()
            if draw.textlength(trial, font=fnt) <= max_w or not cur:
                cur = trial
            else:
                lines.append(cur)
                cur = word
        if cur:
            lines.append(cur)
    if len(lines) > max_lines:
        lines = lines[:max_lines]
        while lines and draw.textlength(lines[-1] + "…", font=fnt) > max_w:
            lines[-1] = lines[-1].rsplit(" ", 1)[0]
        lines[-1] += "…"
    return lines


def fit_font(draw: ImageDraw.ImageDraw, text: str, kind: str, size: int,
             max_w: int, max_lines: int, min_size: int = 34):
    """Giảm dần cỡ chữ cho tới khi nội dung vừa đúng số dòng cho phép."""
    while size > min_size:
        fnt = font(kind, size)
        lines = wrap(draw, text, fnt, max_w, max_lines + 1)
        if len(lines) <= max_lines and not lines[-1].endswith("…"):
            return fnt, lines
        size -= 3
    fnt = font(kind, min_size)
    return fnt, wrap(draw, text, fnt, max_w, max_lines)


def pill(draw: ImageDraw.ImageDraw, xy, text: str, fnt, fill, fg=(255, 255, 255), pad=(22, 11)):
    x, y = xy
    tw = draw.textlength(text, font=fnt)
    th = fnt.size
    box = (x, y, x + tw + pad[0] * 2, y + th + pad[1] * 2)
    draw.rounded_rectangle(box, radius=(box[3] - box[1]) // 2, fill=fill)
    draw.text((x + pad[0], y + pad[1] - 2), text, font=fnt, fill=fg)
    return box[2] - box[0]


def shadow_layer(size, draw_fn, blur=26, alpha=150) -> Image.Image:
    layer = Image.new("L", size, 0)
    draw_fn(ImageDraw.Draw(layer))
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    out = Image.new("RGBA", size, (0, 0, 0, 0))
    out.putalpha(layer.point(lambda v: min(alpha, v)))
    return out


def rounded_photo(photo: Path, w: int, h: int, radius: int = 40) -> Image.Image:
    img = cover(Image.open(photo), w, h).convert("RGBA")
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w, h), radius=radius, fill=255)
    img.putalpha(mask)
    return img


# --------------------------------------------------------------- lớp giao diện

def make_ui(scene: dict, photo: Path | None, cfg: dict, date_label: str,
            full_bleed: bool = False) -> Image.Image:
    """full_bleed=True: nền đã là clip AI phủ kín khung, nên bỏ thẻ ảnh đi,
    chỉ giữ tiêu đề và badge. Giữ thẻ ảnh chồng lên clip sẽ che mất cảnh."""
    brand = cfg["brand"]
    # Kênh tin đếm "TIN 3/10"; kênh phim truyện đếm cảnh, gắn cứng chữ "TIN" vào
    # một tập hoạt hình thì đọc rất vô duyên. Nhãn lấy từ cấu hình chủ đề.
    chip_label = cfg.get("captions", {}).get("chip_label", "TIN")
    accent = hex_to_rgb(brand["accent"])
    accent2 = hex_to_rgb(brand["accent2"])
    ui = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(ui)
    content_w = W - MARGIN * 2

    # ---- thanh thương hiệu trên đầu
    f_brand = font("head", 40)
    f_small = font("body", 30)
    used = pill(d, (MARGIN, 236), brand["name"].upper(), f_brand, accent + (255,))
    d.text((MARGIN + used + 22, 248), date_label, font=f_small, fill=(255, 255, 255, 210))

    if scene["kind"] == "news" and not full_bleed:
        # ---- thẻ ảnh có đổ bóng
        card_w = content_w
        ui.alpha_composite(shadow_layer(
            (W, H), lambda dd: dd.rounded_rectangle(
                (MARGIN, CARD_TOP + 16, MARGIN + card_w, CARD_TOP + CARD_H + 16), radius=40, fill=255)))
        if photo is not None:
            ui.alpha_composite(rounded_photo(photo, card_w, CARD_H), (MARGIN, CARD_TOP))
        else:
            d.rounded_rectangle((MARGIN, CARD_TOP, MARGIN + card_w, CARD_TOP + CARD_H),
                                radius=40, fill=accent + (90,))
        d.rounded_rectangle((MARGIN, CARD_TOP, MARGIN + card_w, CARD_TOP + CARD_H),
                            radius=40, outline=(255, 255, 255, 60), width=3)

        # ---- số thứ tự tin, nằm đè lên góc thẻ
        f_idx = font("head", 52)
        chip = f"{chip_label} {scene['index']}/{scene['total']}"
        pill(d, (MARGIN + 26, CARD_TOP - 30), chip, f_idx, accent2 + (255,), fg=(20, 16, 10))

        # ---- tiêu đề
        f_head, lines = fit_font(d, scene["headline"], "head", 58, content_w, 3, min_size=42)
        y = HEADLINE_TOP
        for line in lines:
            d.text((MARGIN + 3, y + 3), line, font=f_head, fill=(0, 0, 0, 170))
            d.text((MARGIN, y), line, font=f_head, fill=(255, 255, 255, 255))
            y += round(f_head.size * 1.22)

        if scene.get("source"):
            pill(d, (MARGIN, y + 14), f"Nguồn: {scene['source']}", font("body", 28),
                 (255, 255, 255, 38), fg=(255, 255, 255, 225))

    elif scene["kind"] == "news":
        # ---- nền là clip AI: chỉ cần tiêu đề, đặt thấp hơn cho thoáng mặt người
        f_head, lines = fit_font(d, scene["headline"], "head", 58, content_w, 3, min_size=42)
        y = CARD_TOP + CARD_H - 40
        d.rounded_rectangle((MARGIN - 24, y - 34, W - MARGIN + 24,
                             y + len(lines) * round(f_head.size * 1.22) + 76),
                            radius=32, fill=(0, 0, 0, 120))
        f_idx = font("head", 52)
        pill(d, (MARGIN, y - 100), f"{chip_label} {scene['index']}/{scene['total']}", f_idx,
             accent2 + (255,), fg=(20, 16, 10))
        for line in lines:
            d.text((MARGIN + 3, y + 3), line, font=f_head, fill=(0, 0, 0, 170))
            d.text((MARGIN, y), line, font=f_head, fill=(255, 255, 255, 255))
            y += round(f_head.size * 1.22)
        if scene.get("source"):
            pill(d, (MARGIN, y + 14), f"Nguồn: {scene['source']}", font("body", 28),
                 (255, 255, 255, 38), fg=(255, 255, 255, 225))

    else:
        # ---- cảnh mở đầu / kết: chữ lớn giữa khung
        f_big, lines = fit_font(d, scene["headline"].replace("\n", " "), "head",
                                92 if scene["kind"] == "intro" else 80, content_w, 2, min_size=48)
        block_h = len(lines) * round(f_big.size * 1.18)
        y = 700 if scene["kind"] == "intro" else 760
        d.rounded_rectangle((MARGIN - 26, y - 56, W - MARGIN + 26, y + block_h + 56),
                            radius=48, fill=(0, 0, 0, 96))
        for line in lines:
            tw = d.textlength(line, font=f_big)
            x = (W - tw) / 2
            d.text((x + 4, y + 4), line, font=f_big, fill=(0, 0, 0, 160))
            d.text((x, y), line, font=f_big, fill=(255, 255, 255, 255))
            y += round(f_big.size * 1.18)
        if scene["kind"] == "outro":
            tag = brand["handle"]
            f_tag = font("head", 54)
            tw = d.textlength(tag, font=f_tag)
            pill(d, ((W - tw - 60) / 2, y + 46), tag, f_tag, accent + (255,))

    # ---- chân trang
    f_foot = font("body", 28)
    foot = f"{brand['handle']} · {brand['tagline']}"
    tw = d.textlength(foot, font=f_foot)
    d.text(((W - tw) / 2, PROGRESS_Y + 40), foot, font=f_foot, fill=(255, 255, 255, 160))
    return ui


def make_progress(ratio: float, cfg: dict) -> Image.Image:
    """Thanh tiến độ mỏng — tín hiệu 'sắp hết' giúp giữ người xem tới cuối."""
    accent2 = hex_to_rgb(cfg["brand"]["accent2"])
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    x0, x1 = MARGIN, W - MARGIN
    d.rounded_rectangle((x0, PROGRESS_Y, x1, PROGRESS_Y + 10), radius=5, fill=(255, 255, 255, 55))
    end = x0 + (x1 - x0) * max(0.0, min(1.0, ratio))
    if end > x0 + 6:
        d.rounded_rectangle((x0, PROGRESS_Y, end, PROGRESS_Y + 10), radius=5, fill=accent2 + (255,))
    return layer


# ------------------------------------------------------------- phụ đề karaoke

def caption_cards(words: list[dict], cfg: dict) -> list[dict]:
    """Gom các chữ thành cụm ngắn; mỗi chữ là 1 'trạng thái' được tô sáng."""
    n = cfg["captions"]["max_words_per_card"]
    gap_break = cfg["captions"].get("gap_break_sec", 0.32)
    groups: list[list[dict]] = []
    cur: list[dict] = []
    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        # ngắt cụm khi: đủ số chữ, sang cảnh khác, hoặc có quãng nghỉ trong lời đọc
        end_of_group = (
            nxt is None
            or len(cur) >= n
            or nxt["scene"] != w["scene"]
            or nxt["start"] - (w["start"] + w["dur"]) > gap_break
        )
        if end_of_group:
            groups.append(cur)
            cur = []
    if cur:
        groups.append(cur)

    states: list[dict] = []
    for g in groups:
        text_words = [w["text"] for w in g]
        for i, w in enumerate(g):
            nxt = g[i + 1]["start"] if i + 1 < len(g) else w["start"] + w["dur"]
            states.append({
                "words": text_words,
                "active": i,
                "start": w["start"],
                "end": max(nxt, w["start"] + 0.08),
            })
    return states


def render_caption(state: dict, cfg: dict) -> Image.Image:
    c = cfg["captions"]
    fnt = font("cap", c["font_size"])
    hi = hex_to_rgb(c["highlight"])
    base = hex_to_rgb(c["base_color"])
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    space = d.textlength(" ", font=fnt)
    max_w = W - MARGIN * 2
    lines: list[list[int]] = [[]]
    widths: list[float] = [0.0]
    for i, word in enumerate(state["words"]):
        ww = d.textlength(word, font=fnt)
        add = ww + (space if lines[-1] else 0)
        if widths[-1] + add > max_w and lines[-1]:
            lines.append([]); widths.append(0.0)
            add = ww
        lines[-1].append(i)
        widths[-1] += add

    lh = round(fnt.size * 1.16)
    y = CAPTION_TOP
    for line, lw in zip(lines, widths):
        x = (W - lw) / 2
        for idx in line:
            word = state["words"][idx]
            color = hi if idx == state["active"] else base
            d.text((x, y), word, font=fnt, fill=color + (255,),
                   stroke_width=c["stroke"], stroke_fill=(0, 0, 0, 235))
            x += d.textlength(word, font=fnt) + space
        y += lh
    return layer


# ------------------------------------------------------------------ pipeline

def build(script: dict, voice: dict, cfg: dict, workdir: Path,
          clips: dict | None = None) -> dict:
    """clips: {chỉ_số_cảnh: {"path": Path|None, ...}} từ pipeline.aiclip."""
    step("B4 · Dựng hình")
    workdir.mkdir(parents=True, exist_ok=True)
    cache = ROOT / "assets" / "broll" / "_cache"
    date_label = script["date"].split("-")[::-1]
    date_label = f"{date_label[0]}/{date_label[1]}"
    total = voice["total"]

    clips = clips or {}
    scenes_out = []
    for i, scene in enumerate(voice["scenes"]):
        clip = (clips.get(i) or {}).get("path")
        photo = download(scene.get("image", ""), cache)
        if photo is None and scene["kind"] == "news" and clip is None:
            log(f"⚠ cảnh {i} không tải được ảnh, dùng nền gradient")

        # Có clip thì ffmpeg lấy clip làm nền; ảnh tĩnh vẫn được dựng để làm
        # phương án dự phòng và để lấy ảnh bìa.
        bg = make_background(photo, cfg)
        bg_path = workdir / f"bg_{i:02d}.jpg"
        bg.save(bg_path, quality=92)

        ui = make_ui(scene, photo, cfg, date_label, full_bleed=clip is not None)
        ui.alpha_composite(make_progress((scene["start"] + scene["dur"]) / total, cfg))
        ui_path = workdir / f"ui_{i:02d}.png"
        ui.save(ui_path)
        scenes_out.append({"bg": bg_path.name, "ui": ui_path.name,
                           "clip": str(clip) if clip else None,
                           "start": scene["start"], "dur": scene["dur"], "kind": scene["kind"]})

    cap_dir = workdir / "caps"
    cap_dir.mkdir(exist_ok=True)
    for f in cap_dir.glob("*.png"):
        f.unlink()
    states = caption_cards(voice["words"], cfg)
    for j, st in enumerate(states):
        render_caption(st, cfg).save(cap_dir / f"cap_{j:04d}.png")
    log(f"✓ {len(scenes_out)} cảnh · {len(states)} khung phụ đề")

    # ảnh bìa: lấy khung cảnh tin đầu tiên
    first_news = next((i for i, s in enumerate(voice["scenes"]) if s["kind"] == "news"), 0)
    thumb = Image.open(workdir / f"bg_{first_news:02d}.jpg").convert("RGBA")
    thumb.alpha_composite(Image.open(workdir / f"ui_{first_news:02d}.png"))
    thumb.convert("RGB").save(workdir / "thumbnail.jpg", quality=92)

    return {"scenes": scenes_out, "captions": states, "caption_dir": str(cap_dir)}


def main() -> None:
    ap = argparse.ArgumentParser(description="Dựng hình cho video")
    ap.add_argument("--script", default=str(ROOT / "output" / "script.json"))
    ap.add_argument("--workdir", default=str(ROOT / "output" / "_work"))
    args = ap.parse_args()
    cfg = load_config()
    script = json.loads(Path(args.script).read_text(encoding="utf-8"))
    voice = json.loads((Path(args.workdir) / "voice.json").read_text(encoding="utf-8"))
    out = build(script, voice, cfg, Path(args.workdir))
    (Path(args.workdir) / "visuals.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    log(f"→ {Path(args.workdir) / 'visuals.json'}")


if __name__ == "__main__":
    main()
