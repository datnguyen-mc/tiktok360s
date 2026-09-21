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


def config(cfg: dict) -> dict:
    """Gộp phần cấu hình công khai với khoá bí mật đọc từ môi trường."""
    c = cfg.get("r2") or {}
    endpoint = (os.environ.get("R2_ENDPOINT") or c.get("endpoint") or "").rstrip("/")
    return {
        "enabled": bool(c.get("enabled", False)),
        "bucket": os.environ.get("R2_BUCKET") or c.get("bucket") or "",
        "endpoint": endpoint,
        # Tên miền công khai của bucket (r2.dev hoặc domain riêng). Bỏ trống thì
        # URL trả về trỏ thẳng vào endpoint — chỉ mở được khi có chữ ký.
        "public_url": (os.environ.get("R2_PUBLIC_URL") or c.get("public_url") or "").rstrip("/"),
        "prefix": (c.get("prefix") or "").strip("/"),
        "access_key": _secret("R2_ACCESS_KEY_ID"),
        "secret_key": _secret("R2_SECRET_ACCESS_KEY"),
    }


def ready(conf: dict) -> bool:
    return bool(conf["enabled"] and conf["bucket"] and conf["endpoint"]
                and conf["access_key"] and conf["secret_key"])


def missing(conf: dict) -> list[str]:
    """Những thứ còn thiếu, để báo cho người dùng biết phải điền gì."""
    thieu = []
    if not conf["bucket"]:
        thieu.append("bucket (config.json → r2.bucket)")
    if not conf["endpoint"]:
        thieu.append("endpoint (config.json → r2.endpoint)")
    if not conf["access_key"]:
        thieu.append("R2_ACCESS_KEY_ID (cms/.env)")
    if not conf["secret_key"]:
        thieu.append("R2_SECRET_ACCESS_KEY (cms/.env)")
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


def object_key(conf: dict, topic: str, date: str, filename: str) -> str:
    """videos/<chủ đề>/<ngày>/<tên file> — trùng cấu trúc thư mục output/."""
    parts = [conf["prefix"], topic or "chung", date, filename]
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


def upload_run(video: Path | None, thumbnail: Path | None, topic: str,
               date: str, cfg: dict) -> dict:
    """Đẩy sản phẩm của một lần chạy lên R2. Trả về {video_url, thumbnail_url}."""
    conf = config(cfg)
    if not conf["enabled"]:
        return {}
    if not ready(conf):
        log(f"⚠ R2: chưa đủ cấu hình ({', '.join(missing(conf))}) — bỏ qua bước tải lên")
        return {}

    out: dict[str, str] = {}
    log(f"tải lên R2 · bucket {conf['bucket']}")
    if video and video.exists():
        if u := upload(video, object_key(conf, topic, date, video.name), conf):
            out["video_url"] = u
    if thumbnail and thumbnail.exists():
        if u := upload(thumbnail, object_key(conf, topic, date, thumbnail.name), conf):
            out["thumbnail_url"] = u
    return out


def push_from_output(date: str, cfg: dict) -> dict:
    """Nạp lại một ngày đã render lên R2, rồi cập nhật URL vào CMS.

    Dùng cho `make r2-push` — video render trước khi bật R2 vẫn đưa lên được,
    không phải render lại.
    """
    from . import cms
    from .topics import output_dir

    outdir = output_dir(cfg, date)
    videos = sorted(outdir.glob("*.mp4"))
    if not videos:
        log(f"⚠ không có video nào trong {outdir}")
        return {}

    thumb = outdir / "thumbnail.jpg"
    urls = upload_run(videos[0], thumb if thumb.exists() else None,
                      cfg.get("topic", ""), date, cfg)
    if urls:
        script_file = outdir / "script.json"
        if script_file.exists():
            import json
            script = json.loads(script_file.read_text(encoding="utf-8"))
            payload = cms.build_payload(script, None, videos[0],
                                        thumb if thumb.exists() else None)
            payload.update(urls)
            cms.push(payload, cfg)
    return urls


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
            log("R2 đang tắt — bật ở config.json → r2.enabled")
        elif thieu := missing(conf):
            log(f"còn thiếu: {', '.join(thieu)}")
        else:
            log(f"✓ đủ cấu hình · bucket {conf['bucket']} · {conf['endpoint']}")
            log(f"  URL mẫu: {public_url(conf, object_key(conf, 'chomeo', '2026-09-22', 'tap-01.mp4'))}")
        return

    push_from_output(args.date or datetime.now().strftime("%Y-%m-%d"), cfg)


if __name__ == "__main__":
    main()
