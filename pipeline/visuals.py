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

from . import logos
from .common import ROOT, hex_to_rgb, load_config, log, rel, step

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36"

W, H = 1080, 1920
MARGIN = 90                      # lề trái/phải cho khối nội dung
CARD_TOP, CARD_H = 306, 744      # thẻ ảnh tin
HEADLINE_TOP = 1094
CAPTION_TOP = 1400               # mặc định; mỗi kênh chỉnh bằng captions.y_ratio
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


def pill(draw: ImageDraw.ImageDraw, xy, text: str, fnt, fill, fg=(255, 255, 255), pad=(22, 11),
         max_w: int | None = None):
    """Nhãn bo tròn. `max_w` là bề ngang tối đa — chữ dài hơn thì cắt bớt, thêm '…'.

    Không có chốt này thì nhãn nguồn (lấy nguyên tiêu đề bài) chạy tràn ra ngoài
    khung và bị cắt cụt ngay giữa chữ.
    """
    x, y = xy
    if max_w is not None:
        gioi_han = max_w - pad[0] * 2
        if draw.textlength(text, font=fnt) > gioi_han:
            while text and draw.textlength(text + "…", font=fnt) > gioi_han:
                text = text[:-1]
            text = text.rstrip(" ,.;:-") + "…"
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

# Nhãn mặc định cho bảng hồ sơ, dùng khi kênh không khai `series.ho_so.truong`.
# Giữ đúng từ ngữ bóng đá để kênh clb không đổi gì khi nâng cấp.
TRUONG_MAC_DINH = [
    {"khoa": "nam", "nhan": "Thành lập"},
    {"khoa": "san", "nhan": "Sân nhà"},
    {"khoa": "danh_hieu", "nhan": "Danh hiệu", "tach": "·"},
]


def _the_ho_so(ui: Image.Image, d: ImageDraw.ImageDraw, the: dict,
               x: int, y: int, w: int, h: int,
               accent: tuple, accent2: tuple, noi_bat: str | None = None,
               logo: Path | None = None, truong: list[dict] | None = None) -> None:
    """Bảng hồ sơ một mục, vẽ vào chỗ lẽ ra là ảnh.

    Dòng trên cùng là nhóm (giải đấu, vùng miền…), rồi tên, rồi các dòng dữ kiện
    do kênh tự khai qua `series.ho_so.truong` — mỗi dòng một cặp {khoa, nhan}.
    Trường nào có `"tach"` thì tách theo ký tự đó thành danh sách gạch đầu dòng:
    nhồi một dòng dài thì chữ co lại tới mức không đọc nổi trên điện thoại.
    """
    truong = truong or TRUONG_MAC_DINH
    d.rounded_rectangle((x, y, x + w, y + h), radius=40, fill=(12, 18, 32, 235))

    # Vạch màu bên trái làm điểm tựa cho mắt
    d.rounded_rectangle((x + 34, y + 44, x + 44, y + h - 44), radius=5, fill=accent + (255,))

    px = x + 74
    pw = w - 108
    cy = y + 52

    # Logo ở góc dưới phải: chỗ đó vốn bỏ trống vì danh hiệu hiếm khi dài hết
    # bảng, mà huy hiệu đội thì nên thấy suốt video chứ không chỉ ở cảnh mở đầu.
    dk_logo = 0
    if logo is not None:
        dk_logo = min(300, h // 2)
        _logo(ui, logo, x + w - dk_logo // 2 - 40, y + h - dk_logo // 2 - 36, dk_logo)

    # Phần đang được nói tới thì sáng lên, phần còn lại mờ đi. Bảng đứng yên
    # suốt video thì người xem hết nhìn sau năm giây.
    def mo(khoa: str) -> int:
        if noi_bat is None:
            return 235
        return 255 if khoa == noi_bat else 85

    if the.get("giai"):
        f = font("body", 30)
        d.text((px, cy), the["giai"].upper(), font=f, fill=accent2 + (255,))
        cy += 46

    # Tên CLB: cỡ chữ tự co cho vừa một dòng
    f_ten, dong_ten = fit_font(d, the.get("ten", ""), "head", 62, pw, 1, min_size=36)
    d.text((px, cy), dong_ten[0] if dong_ten else the.get("ten", ""),
           font=f_ten, fill=(255, 255, 255, 255))
    cy += f_ten.size + 26

    f_nho = font("body", 32)
    f_dh = font("body", 30)
    # Dòng nào nằm ngang tầm logo thì phải hẹp lại cho khỏi đâm vào huy hiệu.
    moc_logo = y + h - dk_logo - 36 if dk_logo else y + h

    for t in truong:
        khoa, nhan, tach = t.get("khoa"), t.get("nhan", ""), t.get("tach")
        gt = the.get(khoa)
        if not gt or cy > y + h - 90:
            continue
        a = mo(khoa)
        if khoa == noi_bat:
            # Vạch nhỏ bên trái chỉ đúng dòng đang nói
            day = (y + h - 52) if tach else (cy + 68)
            d.rounded_rectangle((px - 24, cy + 4, px - 18, day), radius=3,
                                fill=accent2 + (255,))
        d.text((px, cy), nhan, font=font("body", 26), fill=(255, 255, 255, min(a, 150)))
        cy += 32 if not tach else 34

        if not tach:
            for dong in wrap(d, str(gt), f_nho, pw, 2):
                d.text((px, cy), dong, font=f_nho, fill=(255, 255, 255, a))
                cy += 40
            cy += 8
            continue

        for phan in [x.strip() for x in str(gt).split(tach) if x.strip()]:
            if cy > y + h - 46:
                break
            rong = pw - 30 - (dk_logo + 40 if cy > moc_logo else 0)
            d.ellipse((px + 2, cy + 13, px + 12, cy + 23), fill=accent + (a,))
            for dong in wrap(d, phan, f_dh, rong, 2):
                d.text((px + 28, cy), dong, font=f_dh, fill=(255, 255, 255, a))
                cy += 38
            cy += 4

    d.rounded_rectangle((x, y, x + w, y + h), radius=40,
                        outline=accent + (110,), width=3)


def _logo(ui: Image.Image, path: Path, cx: int, cy: int, dk: int) -> None:
    """Logo CLB đặt trên đĩa trắng, tâm (cx, cy), đường kính dk.

    Nhiều logo tối màu (Juventus, Tottenham) đặt thẳng lên nền tối là chìm mất;
    đĩa trắng giữ cho logo nào cũng rõ.
    """
    r = dk // 2
    box = (cx - r, cy - r, cx + r, cy + r)
    ui.alpha_composite(shadow_layer(
        (W, H), lambda dd: dd.ellipse((box[0], box[1] + 16, box[2], box[3] + 16), fill=255)))
    ImageDraw.Draw(ui).ellipse(box, fill=(255, 255, 255, 255))

    img = Image.open(path).convert("RGBA")
    # Co vào hình vuông nội tiếp của đĩa, chừa lề để logo tròn không chạm viền
    o = int(dk * 0.64)
    k = min(o / img.width, o / img.height)
    img = img.resize((max(1, round(img.width * k)), max(1, round(img.height * k))), Image.LANCZOS)
    ui.alpha_composite(img, (cx - img.width // 2, cy - img.height // 2))


def make_ui(scene: dict, photo: Path | None, cfg: dict, date_label: str,
            full_bleed: bool = False, logo: Path | None = None) -> Image.Image:
    """full_bleed=True: nền đã là clip AI phủ kín khung, nên bỏ thẻ ảnh đi,
    chỉ giữ tiêu đề và badge. Giữ thẻ ảnh chồng lên clip sẽ che mất cảnh.

    logo: logo CLB, chỉ vẽ ở cảnh mở đầu."""
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
        elif scene.get("the_thong_tin"):
            # Kênh tư liệu không có ảnh báo để dùng. Thay vì bỏ trống một mảng
            # màu, vẽ thẳng dữ kiện lên đó — đằng nào người xem cũng cần thấy
            # năm thành lập, sân nhà và danh hiệu chứ không chỉ nghe đọc.
            _the_ho_so(ui, d, scene["the_thong_tin"], MARGIN, CARD_TOP,
                       card_w, CARD_H, accent, accent2, scene.get("noi_bat"), logo,
                       truong=(cfg.get("series", {}).get("ho_so") or {}).get("truong"))
        else:
            d.rounded_rectangle((MARGIN, CARD_TOP, MARGIN + card_w, CARD_TOP + CARD_H),
                                radius=40, fill=accent + (90,))
        d.rounded_rectangle((MARGIN, CARD_TOP, MARGIN + card_w, CARD_TOP + CARD_H),
                            radius=40, outline=(255, 255, 255, 60), width=3)

        # ---- số thứ tự tin, đè lên GÓC PHẢI của thẻ
        # Đặt bên trái thì nó chồng lên thẻ thương hiệu ngay phía trên, hai khối
        # màu dính vào nhau trông như lỗi dựng.
        f_idx = font("head", 52)
        chip = f"{chip_label} {scene['index']}/{scene['total']}"
        chip_w = d.textlength(chip, font=f_idx) + 44
        pill(d, (MARGIN + card_w - chip_w - 26, CARD_TOP - 30), chip, f_idx,
             accent2 + (255,), fg=(20, 16, 10))

        # ---- tiêu đề
        f_head, lines = fit_font(d, scene["headline"], "head", 58, content_w, 3, min_size=42)
        y = HEADLINE_TOP
        for line in lines:
            d.text((MARGIN + 3, y + 3), line, font=f_head, fill=(0, 0, 0, 170))
            d.text((MARGIN, y), line, font=f_head, fill=(255, 255, 255, 255))
            y += round(f_head.size * 1.22)

        if scene.get("source"):
            pill(d, (MARGIN, y + 14), f"Nguồn: {scene['source']}", font("body", 28),
                 (255, 255, 255, 38), fg=(255, 255, 255, 225), max_w=content_w)

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
                 (255, 255, 255, 38), fg=(255, 255, 255, 225), max_w=content_w)

    else:
        # ---- cảnh mở đầu / kết: chữ lớn giữa khung
        f_big, lines = fit_font(d, scene["headline"].replace("\n", " "), "head",
                                92 if scene["kind"] == "intro" else 80, content_w, 2, min_size=48)
        block_h = len(lines) * round(f_big.size * 1.18)
        y = 700 if scene["kind"] == "intro" else 760
        if scene["kind"] == "intro" and logo is not None:
            # Logo là thứ nhận ra ngay trong một giây đầu, nên để to: 560px trên
            # khung rộng 1080 là hơn nửa bề ngang. Khối chữ lùi xuống tương ứng.
            _logo(ui, logo, W // 2, 616, 560)
            y = 976
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


def _con_tro(d: ImageDraw.ImageDraw, x: int, y: int, cao: int = 128) -> None:
    """Con trỏ hình bàn tay bấm, vẽ bằng đa giác — không cần file ảnh kèm theo."""
    k = cao / 128
    than = [(x, y), (x + 46 * k, y + 92 * k), (x + 25 * k, y + 96 * k),
            (x + 44 * k, y + 128 * k), (x + 30 * k, y + 136 * k),
            (x + 12 * k, y + 104 * k), (x - 2 * k, y + 120 * k)]
    d.polygon(than, fill=(255, 255, 255, 255), outline=(16, 16, 20, 255))
    d.line(than + [than[0]], fill=(16, 16, 20, 255), width=max(2, round(5 * k)), joint="curve")


def make_follow(cfg: dict, logo: Path | None = None, phu: str = "") -> Image.Image:
    """Màn hình mời theo dõi, chèn trước cảnh mở đầu.

    Người xem lướt tới video này lần đầu thì chưa biết kênh là gì. Một khung
    đứng yên hơn một giây, có đúng ba thứ — huy hiệu, tên kênh, nút theo dõi —
    đọc xong trong một nhịp mắt. Nhồi thêm chữ là thành màn hình quảng cáo và
    người ta vuốt qua.

    `phu` là dòng phụ tuỳ kênh, ví dụ "TẬP 12" — cho người xem biết đây là series.
    """
    brand = cfg["brand"]
    accent = hex_to_rgb(brand["accent"])
    accent2 = hex_to_rgb(brand["accent2"])

    base = gradient((10, 6, 20), (max(0, accent[0] // 3), 6, 40))
    glow = Image.new("RGB", (W, H), (0, 0, 0))
    ImageDraw.Draw(glow).ellipse((-200, 220, W + 200, 1100), fill=accent)
    base = Image.blend(base, glow.filter(ImageFilter.GaussianBlur(190)), 0.34)

    ui = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(ui)

    # ---- vòng sáng quanh huy hiệu, hai lớp cho có chiều sâu
    # Khối nội dung đặt cao: giao diện TikTok (chú thích, hàng nút bên phải) phủ
    # khoảng một phần tư dưới màn hình, chữ rơi vào đó là bị che.
    cx, cy, dk = W // 2, 620, 440
    for r, mau in ((dk // 2 + 54, accent2 + (110,)), (dk // 2 + 26, accent2 + (235,))):
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=mau, width=9)

    if logo is not None:
        _logo(ui, logo, cx, cy, dk)
    else:
        # Kênh tin không có huy hiệu đội: dùng chữ cái đầu của tên kênh.
        r = dk // 2
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(255, 255, 255, 255))
        chu = (brand["name"].strip() or "?")[0].upper()
        f = font("head", 220)
        w_chu = d.textlength(chu, font=f)
        d.text((cx - w_chu / 2, cy - f.size * 0.72), chu, font=f, fill=accent + (255,))

    # ---- tên kênh
    f_ten, dong = fit_font(d, brand["name"].upper(), "head", 78, W - MARGIN * 2, 2, min_size=52)
    y = cy + dk // 2 + 120
    for line in dong:
        tw = d.textlength(line, font=f_ten)
        d.text(((W - tw) / 2 + 4, y + 4), line, font=f_ten, fill=(0, 0, 0, 170))
        d.text(((W - tw) / 2, y), line, font=f_ten, fill=(255, 255, 255, 255))
        y += round(f_ten.size * 1.16)

    # ---- handle + dòng phụ
    f_h = font("body", 40)
    nhan = brand["handle"] + (f"  ·  {phu}" if phu else "")
    tw = d.textlength(nhan, font=f_h)
    d.text(((W - tw) / 2, y + 14), nhan, font=f_h, fill=(255, 255, 255, 205))

    # ---- nút Theo dõi, dáng giống nút thật trong ứng dụng
    f_nut = font("head", 62)
    chu_nut = "+  Theo dõi"
    nw = d.textlength(chu_nut, font=f_nut)
    bw, bh = nw + 150, 136
    bx, by = (W - bw) / 2, y + 150
    ui.alpha_composite(shadow_layer(
        (W, H), lambda dd: dd.rounded_rectangle((bx, by + 14, bx + bw, by + bh + 14),
                                                radius=bh // 2, fill=255), blur=30, alpha=170))
    d.rounded_rectangle((bx, by, bx + bw, by + bh), radius=bh // 2, fill=accent + (255,))
    d.text(((W - nw) / 2, by + (bh - f_nut.size) / 2 - 8), chu_nut,
           font=f_nut, fill=(255, 255, 255, 255))

    # ---- con trỏ chỉ vào nút
    _con_tro(d, int(bx + bw - 86), int(by + bh - 34), 132)

    # ---- khẩu hiệu dưới cùng
    f_tag = font("body", 36)
    tw = d.textlength(brand["tagline"], font=f_tag)
    d.text(((W - tw) / 2, by + bh + 150), brand["tagline"], font=f_tag,
           fill=(255, 255, 255, 150))

    out = base.convert("RGBA")
    out.alpha_composite(ui)
    return out.convert("RGB")


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
    # Kênh tư liệu có bảng thông tin cao hơn kênh tin, nên phụ đề phải xuống
    # thấp hơn để không chạm đáy bảng.
    y = round(H * c["y_ratio"]) if c.get("y_ratio") else CAPTION_TOP
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

        # Tra logo cho MỌI cảnh có dữ kiện CLB, không riêng cảnh mở đầu: bảng
        # thông tin ở cảnh thường cũng vẽ huy hiệu, thiếu nó thì góc dưới bảng
        # bỏ trống và cả video chỉ thấy huy hiệu đúng một lần.
        logo = None
        if scene.get("the_thong_tin"):
            logo = logos.find(scene["the_thong_tin"].get("ten", ""))

        ui = make_ui(scene, photo, cfg, date_label, full_bleed=clip is not None, logo=logo)
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

    # ---- màn hình mời theo dõi, chèn trước cảnh mở đầu
    hook_sec = float(cfg["video"].get("hook_sec", 1.6))
    hook_path = None
    if hook_sec > 0:
        # Huy hiệu lấy của cảnh mở đầu; kênh tin không có thì make_follow() tự
        # dùng chữ cái đầu tên kênh.
        lg = None
        for sc in voice["scenes"]:
            if sc.get("the_thong_tin"):
                lg = logos.find(sc["the_thong_tin"].get("ten", ""))
                break
        so_tap = script.get("so_tap") or script.get("episode")
        hook_path = workdir / "hook.jpg"
        make_follow(cfg, lg, f"TẬP {so_tap}" if so_tap else "").save(hook_path, quality=92)
        log(f"✓ màn hình theo dõi · {hook_sec:.1f}s")

    return {"scenes": scenes_out, "captions": states, "caption_dir": str(cap_dir),
            "hook": str(hook_path) if hook_path else None, "hook_sec": hook_sec if hook_path else 0.0}


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
