"""Đẩy video và ảnh bìa lên Cloudflare R2 ngay sau khi render xong.

R2 nói giao thức S3, nên chỉ cần ký yêu cầu theo chuẩn AWS Signature V4 rồi PUT.
Ký tay bằng `hmac` + `urllib` thay vì kéo `boto3` về: cả bản ký chỉ khoảng năm
chục dòng, còn boto3 nặng hơn 70 MB và kéo theo một cây phụ thuộc mà dây chuyền
này không dùng tới chỗ nào khác (`pipeline/aiclip.py` tự ký JWT cho Kling cũng
vì lý do đó).

Khoá KHÔNG bao giờ nằm trong repo. Thứ tự đọc: biến môi trường → `cms/.env`
(file này đã nằm trong .gitignore). Thiếu khoá thì bước tải lên bị bỏ qua và
dây chuyền chạy tiếp bình thường — video vẫn nằm trong output/, nạp lên sau
bằng `make r2-push` lúc nào cũng được.

Cấu hình phần không bí mật (bucket, endpoint, tên miền công khai) ở mục `r2`
trong config.json.
"""
from __future__ import annotations

import hashlib
import hmac
import mimetypes
import os
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from .cms import _env_from_file
from .common import log

ALGO = "AWS4-HMAC-SHA256"
REGION = "auto"          # R2 không phân vùng, nhưng chữ ký vẫn cần một giá trị
SERVICE = "s3"
TIMEOUT = 300            # video 20 MB qua đường truyền chậm vẫn kịp


def _secret(key: str) -> str:
    """Khoá bí mật: biến môi trường trước, rồi tới cms/.env."""
    return os.environ.get(key) or _env_from_file(key)


def _tu_cms(cfg: dict) -> dict | None:
    """Hỏi CMS cấu hình R2. Khoá khai trong giao diện phải tới được dây chuyền."""
    from .cms import config as cms_config

    conf = cms_config(cfg)
    if not conf["enabled"] or not conf["token"]:
        return None

    try:
        req = urllib.request.Request(
            f"{conf['url']}/api/pipeline/r2",
            headers={"X-Ingest-Token": conf["token"], "Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            import json as _json
            return _json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        log(f"  ⚠ không hỏi được cấu hình R2 từ CMS ({e}) — dùng config.json và biến môi trường")
        return None


def config(cfg: dict) -> dict:
    """Gộp cấu hình công khai với khoá bí mật.

    Thứ tự cho TỪNG Ô: CMS → biến môi trường → config.json. Gộp theo từng ô chứ
    không theo cả khối: trước đây chỉ cần ô bucket bên CMS còn trống là cả khối
    bị bỏ qua, nên điền 6/7 ô trong giao diện mà pipeline vẫn báo thiếu sạch.
    """
    tu_cms = _tu_cms(cfg) or {}
    c = cfg.get("r2") or {}

    def lay(ten: str, bien: str) -> str:
        for v in (tu_cms.get(ten), os.environ.get(bien), c.get(ten)):
            if v:
                return str(v).strip()
        return ""

    return {
        # CMS trả lời thì CMS quyết: bỏ tích trong giao diện phải tắt được.
        "enabled": bool(tu_cms["enabled"]) if "enabled" in tu_cms else bool(c.get("enabled", False)),
        "bucket": lay("bucket", "R2_BUCKET"),
        "endpoint": lay("endpoint", "R2_ENDPOINT").rstrip("/"),
        # Tên miền công khai của bucket (r2.dev hoặc domain riêng). Bỏ trống thì
        # URL trả về trỏ thẳng vào endpoint — chỉ mở được khi có chữ ký.
        "public_url": lay("public_url", "R2_PUBLIC_URL").rstrip("/"),
        "prefix": lay("prefix", "R2_PREFIX").strip("/"),
        "access_key": tu_cms.get("access_key") or _secret("R2_ACCESS_KEY_ID"),
        "secret_key": tu_cms.get("secret_key") or _secret("R2_SECRET_ACCESS_KEY"),
    }


def ready(conf: dict) -> bool:
    return bool(conf["enabled"] and conf["bucket"] and conf["endpoint"]
                and conf["access_key"] and conf["secret_key"])


def missing(conf: dict) -> list[str]:
    """Những thứ còn thiếu, để báo cho người dùng biết phải điền gì."""
    thieu = []
    if not conf["bucket"]:
        thieu.append("Bucket (CMS → Cài đặt → Cloudflare R2)")
    if not conf["endpoint"]:
        thieu.append("Endpoint (CMS → Cài đặt → Cloudflare R2)")
    if not conf["access_key"]:
        thieu.append("Access Key ID (CMS → Cài đặt → Cloudflare R2)")
    if not conf["secret_key"]:
        thieu.append("Secret Access Key (CMS → Cài đặt → Cloudflare R2)")
    return thieu


# ------------------------------------------------------------------ ký chữ ký

def _sign(key: bytes, msg: str) -> bytes:
    return hmac.new(key, msg.encode("utf-8"), hashlib.sha256).digest()


def _signing_key(secret: str, stamp: str) -> bytes:
    k = _sign(f"AWS4{secret}".encode("utf-8"), stamp)
    k = _sign(k, REGION)
    k = _sign(k, SERVICE)
    return _sign(k, "aws4_request")


def _auth_headers(conf: dict, method: str, canonical_uri: str,
                  payload: bytes, content_type: str) -> dict:
    """Bộ header đã ký cho một yêu cầu S3 kiểu path-style."""
    host = urllib.parse.urlparse(conf["endpoint"]).netloc
    now = datetime.now(timezone.utc)
    amzdate = now.strftime("%Y%m%dT%H%M%SZ")
    stamp = now.strftime("%Y%m%d")
    payload_hash = hashlib.sha256(payload).hexdigest()

    # Header ký phải xếp theo thứ tự chữ cái và viết thường — chuẩn SigV4.
    signed = {
        "content-type": content_type,
        "host": host,
        "x-amz-content-sha256": payload_hash,
        "x-amz-date": amzdate,
    }
    canonical_headers = "".join(f"{k}:{v}\n" for k, v in sorted(signed.items()))
    signed_headers = ";".join(sorted(signed))

    canonical_request = "\n".join([
        method, canonical_uri, "", canonical_headers, signed_headers, payload_hash,
    ])
    scope = f"{stamp}/{REGION}/{SERVICE}/aws4_request"
    to_sign = "\n".join([
        ALGO, amzdate, scope,
        hashlib.sha256(canonical_request.encode("utf-8")).hexdigest(),
    ])
    signature = hmac.new(_signing_key(conf["secret_key"], stamp),
                         to_sign.encode("utf-8"), hashlib.sha256).hexdigest()

    return {
        **{k: v for k, v in signed.items() if k != "host"},
        "Authorization": (f"{ALGO} Credential={conf['access_key']}/{scope}, "
                          f"SignedHeaders={signed_headers}, Signature={signature}"),
    }


# --------------------------------------------------------------------- tải lên

def _quote(key: str) -> str:
    """Mã hoá từng đoạn đường dẫn, giữ nguyên dấu '/' phân cách."""
    return "/".join(urllib.parse.quote(p, safe="") for p in key.split("/"))


def object_key(conf: dict, topic: str, date: str, filename: str, nhom: str = "") -> str:
    """videos/<chủ đề>/<ngày>/[tap-NN/]<tên file> — trùng cấu trúc thư mục output/.

    `nhom` là nhánh con của ngày, với kênh series là "tap-11". Thiếu nó thì mọi
    tập trong cùng một ngày dùng chung khoá "thumbnail.jpg" và tập sau đè ảnh bìa
    của tập trước — tên video có số tập nên không lộ ra, ảnh bìa thì lộ.
    """
    parts = [conf["prefix"], topic or "chung", date, nhom, filename]
    return "/".join(p.strip("/") for p in parts if p)


def public_url(conf: dict, key: str) -> str:
    base = conf["public_url"] or f"{conf['endpoint']}/{conf['bucket']}"
    return f"{base}/{_quote(key)}"


def upload(path: Path, key: str, conf: dict) -> str | None:
    """PUT một file lên R2. Trả về URL công khai, hoặc None nếu hỏng.

    Không bao giờ ném lỗi ra ngoài: giống nguyên tắc của pipeline/cms.py, hạ
    tầng phụ hỏng thì video vẫn phải ra, file vẫn còn nguyên trong output/.
    """
    if not path.exists():
        log(f"⚠ R2: không có file {path}")
        return None

    data = path.read_bytes()
    content_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    canonical_uri = f"/{conf['bucket']}/{_quote(key)}"
    url = f"{conf['endpoint']}{canonical_uri}"

    req = urllib.request.Request(
        url, data=data, method="PUT",
        headers=_auth_headers(conf, "PUT", canonical_uri, data, content_type))
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            if resp.status not in (200, 201):
                log(f"⚠ R2: {key} trả về HTTP {resp.status}")
                return None
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:300]
        log(f"⚠ R2: {key} hỏng HTTP {e.code} — {detail}")
        return None
    except Exception as e:                      # noqa: BLE001 — mạng ném đủ loại
        log(f"⚠ R2: không tải lên được {key} ({e}) — file vẫn ở output/")
        return None

    log(f"  ✓ {key} · {len(data) / 1e6:.1f} MB")
    return public_url(conf, key)


def _goi(conf: dict, method: str, key: str, payload: bytes = b"",
         content_type: str = "application/octet-stream") -> tuple[int, bytes, str]:
    """Một yêu cầu đã ký tới R2. Trả về (mã HTTP, thân, mô tả lỗi)."""
    canonical_uri = f"/{conf['bucket']}/{_quote(key)}"
    req = urllib.request.Request(
        f"{conf['endpoint']}{canonical_uri}",
        data=payload if method == "PUT" else None, method=method,
        headers=_auth_headers(conf, method, canonical_uri, payload, content_type))
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, resp.read(), ""
    except urllib.error.HTTPError as e:
        return e.code, b"", e.read().decode("utf-8", "replace")[:200]
    except Exception as e:                      # noqa: BLE001 — mạng ném đủ loại
        return 0, b"", str(e)


def kiem_tra_that(conf: dict) -> bool:
    """PUT → GET → DELETE một file nhỏ.

    Kiểm tra "đã điền đủ ô chưa" không phân biệt được key sai, bucket gõ nhầm
    hay token thiếu quyền ghi — cả ba đều chỉ lộ ra khi gọi thật. Ghi vào
    `<prefix>/_kiem-tra/` rồi xoá, không đụng tới video.
    """
    key = "/".join(p for p in [conf["prefix"], "_kiem-tra",
                               datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ") + ".txt"] if p)
    than = b"tiktok360s r2 check"

    ma, _, loi = _goi(conf, "PUT", key, than, "text/plain")
    if ma not in (200, 201):
        log(f"✗ ghi hỏng — HTTP {ma or 'không nối được'} {loi}")
        if ma == 403:
            log("  403 = key sai, hoặc token không có quyền Object Read & Write")
        elif ma == 404:
            log(f"  404 = bucket '{conf['bucket']}' không tồn tại trên tài khoản này")
        return False
    log(f"✓ ghi được · {key}")

    ma, doc, loi = _goi(conf, "GET", key)
    if ma != 200 or doc != than:
        log(f"✗ đọc lại hỏng — HTTP {ma} {loi}")
        return False
    log("✓ đọc lại khớp")

    ma, _, loi = _goi(conf, "DELETE", key)
    if ma not in (200, 204):
        log(f"⚠ xoá không được — HTTP {ma} {loi} (file thử còn nằm lại ở {key})")
    else:
        log("✓ xoá được · đã dọn file thử")
    return True


def kich_thuoc(conf: dict, key: str) -> int | None:
    """Số byte của object trên R2, hoặc None nếu không có / không hỏi được.

    Dùng HEAD chứ không GET: chỉ cần con số, tải lại cả video 13 MB để đếm thì
    phí băng thông.
    """
    canonical_uri = f"/{conf['bucket']}/{_quote(key)}"
    req = urllib.request.Request(
        f"{conf['endpoint']}{canonical_uri}", method="HEAD",
        headers=_auth_headers(conf, "HEAD", canonical_uri, b"", "application/octet-stream"))
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return int(resp.headers.get("Content-Length") or 0)
    except Exception:                           # noqa: BLE001 — mạng ném đủ loại
        return None


def _xoa_local(path: Path, key: str, conf: dict) -> bool:
    """Xoá file dưới máy, nhưng chỉ khi R2 đã có đúng bản đó.

    Xoá là không lùi được, mà sau bước này R2 là bản duy nhất. PUT trả 200 gần
    như chắc chắn là xong, nhưng đọc lại kích thước tốn thêm một phần mười giây
    và chặn được trường hợp file lên thiếu.
    """
    tren_r2 = kich_thuoc(conf, key)
    duoi_may = path.stat().st_size
    if tren_r2 != duoi_may:
        log(f"  ⚠ giữ lại {path.name}: R2 báo {tren_r2} byte, dưới máy {duoi_may} byte")
        return False
    path.unlink()
    return True


def upload_run(video: Path | None, thumbnail: Path | None, topic: str,
               date: str, cfg: dict, xoa_local: bool = False, nhom: str = "") -> dict:
    """Đẩy sản phẩm của một lần chạy lên R2.

    Trả về phần ghi đè cho bản ghi CMS: {video_url, thumbnail_url, video_bytes,
    video_path, thumbnail_path}. Hai ô path trả về None khi file dưới máy đã xoá,
    để bản ghi không trỏ tới chỗ trống.

    `xoa_local` dọn file dưới máy sau khi lên R2. Mặc định TẮT: bản dưới máy là
    chỗ đối chiếu khi cần xem lại, và xoá là không lùi được. Bật thì chỉ xoá đúng
    file nào đã lên và đã đọc lại khớp kích thước.
    """
    conf = config(cfg)
    if not conf["enabled"]:
        return {}
    if not ready(conf):
        log(f"⚠ R2: chưa đủ cấu hình ({', '.join(missing(conf))}) — bỏ qua bước tải lên")
        return {}

    out: dict = {}
    log(f"tải lên R2 · bucket {conf['bucket']}")

    if video and video.exists():
        # Đo trước khi xoá: sau đó không còn file để hỏi kích thước nữa.
        out["video_bytes"] = video.stat().st_size
        key = object_key(conf, topic, date, video.name, nhom)
        if u := upload(video, key, conf):
            out["video_url"] = u
            if xoa_local and _xoa_local(video, key, conf):
                out["video_path"] = None

    if thumbnail and thumbnail.exists():
        key = object_key(conf, topic, date, thumbnail.name, nhom)
        if u := upload(thumbnail, key, conf):
            out["thumbnail_url"] = u
            if xoa_local and _xoa_local(thumbnail, key, conf):
                out["thumbnail_path"] = None

    if xoa_local and ("video_path" in out or "thumbnail_path" in out):
        log("  đã dọn bản dưới máy — R2 giữ bản chính")
    return out


def push_from_output(date: str, cfg: dict, xoa_local: bool = False) -> dict:
    """Nạp lại một ngày đã render lên R2, rồi cập nhật URL vào CMS.

    Dùng cho `make r2-push` — video render trước khi bật R2 vẫn đưa lên được,
    không phải render lại.

    Kênh dạng series ra mỗi ngày nhiều tập, mỗi tập một thư mục `tap-NN/`, nên
    phải duyệt cả thư mục con chứ không chỉ tầng ngày.
    """
    import json

    from . import cms
    from .topics import output_dir

    goc = output_dir(cfg, date)
    thu_muc = [goc] + sorted(d for d in goc.glob("tap-*") if d.is_dir())

    ket_qua: dict = {}
    for d in thu_muc:
        videos = sorted(d.glob("*.mp4"))
        if not videos:
            continue

        thumb = d / "thumbnail.jpg"
        urls = upload_run(videos[0], thumb if thumb.exists() else None,
                          cfg.get("topic", ""), date, cfg, xoa_local=xoa_local,
                          nhom=d.name if d is not goc else "")
        if not urls.get("video_url"):
            continue

        script_file = d / "script.json"
        if script_file.exists():
            script = json.loads(script_file.read_text(encoding="utf-8"))
            payload = cms.build_payload(script, None, videos[0],
                                        thumb if thumb.exists() else None)
            payload.update(urls)
            cms.push(payload, cfg)
        ket_qua[d.name] = urls["video_url"]

    if not ket_qua:
        log(f"⚠ không có video nào trong {goc}")
    return ket_qua


def main() -> None:
    import argparse
    from datetime import datetime

    from .common import load_config
    from .topics import available as available_topics

    ap = argparse.ArgumentParser(description="Tải video đã render lên Cloudflare R2")
    ap.add_argument("--topic", default="", help=f"chủ đề: {', '.join(available_topics())}")
    ap.add_argument("--date", default="", help="YYYY-MM-DD, mặc định hôm nay")
    ap.add_argument("--check", action="store_true", help="chỉ kiểm tra cấu hình, không tải gì")
    args = ap.parse_args()

    cfg = load_config(topic=args.topic or None)
    conf = config(cfg)
    if args.check:
        if not conf["enabled"]:
            log("⚠ R2 đang tắt — bật ở CMS → Cài đặt → Cloudflare R2")
        # Báo hết phần còn thiếu trong một lần, thay vì bắt chạy lại để lòi ra cái kế tiếp.
        if thieu := missing(conf):
            log(f"còn thiếu: {', '.join(thieu)}")
            return
        log(f"cấu hình · bucket {conf['bucket']} · {conf['endpoint']}")
        if kiem_tra_that(conf):
            log(f"  URL mẫu: {public_url(conf, object_key(conf, 'chomeo', '2026-09-22', 'tap-01.mp4'))}")
            if not conf["public_url"]:
                log("  (chưa có tên miền công khai — URL trên chỉ mở được khi có chữ ký)")
        return

    push_from_output(args.date or datetime.now().strftime("%Y-%m-%d"), cfg)


if __name__ == "__main__":
    main()
