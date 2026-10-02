"""Sinh cảnh bằng model AI (Google Veo 3.1, Kling AI) thay cho ảnh báo chí.

Vì sao phải ghép nhiều clip: **cả hai model đều chỉ tạo được clip ngắn** — Veo 4–8
giây, Kling 5 hoặc 10 giây. Không model nào tạo thẳng một video 2 phút. Nên "video
dài theo prompt" ở đây nghĩa là: mỗi tin một clip riêng, rồi ghép lại theo đúng mốc
thời gian của lời đọc. Cảnh nào dài hơn clip thì clip được lặp cho đủ.

Cấu hình (engine, khoá API, mẫu prompt của kênh) lấy từ CMS qua
`GET /api/pipeline/config`. Không có CMS thì không có chế độ này — dây chuyền quay
về dùng ảnh báo như bình thường.

CẢNH BÁO CHI PHÍ: Veo 3.1 Standard tính 0,40 USD mỗi giây video. Một video 110 giây
tốn khoảng 44 USD, tức hơn 1.300 USD mỗi tháng nếu chạy hằng ngày. Luôn xem phần ước
tính trong CMS trước khi bật.

NHẬT KÝ: mọi lần gọi HTTP đều được ghi log — thành công lẫn thất bại, kể cả các lần
hỏi trạng thái — kèm mã HTTP, thời gian và kích thước phản hồi. Khoá API trong query
string bị che trước khi ghi. Mỗi clip xong (hoặc hỏng) được đẩy ngay lên CMS qua
`/api/ingest/generation-call`, không đợi tới cuối lượt chạy: dây chuyền chết giữa
chừng thì bản ghi cuối lượt không bao giờ được gửi, mà đó lại đúng là lần cần soi.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from .common import log, strip_emoji
from .cms import config as cms_config

VEO_BASE = "https://generativelanguage.googleapis.com/v1beta"
KLING_BASE = "https://api-singapore.klingai.com"

POLL_INTERVAL = 10          # giây giữa hai lần hỏi trạng thái
POLL_TIMEOUT = 600          # bỏ cuộc sau 10 phút mỗi clip
MAX_PARALLEL = 3            # nhà cung cấp đều có giới hạn tần suất


# --------------------------------------------------------------- tiện ích HTTP

# Khoá API của Veo nằm ngay trong query string (`?key=AIza...`). Ghi log nguyên
# đường dẫn là khoá lọt vào file log, vào Loki, vào bất cứ đâu log được gửi tới.
_SECRET_PARAMS = ("key", "api_key", "access_token", "token")


def _safe_url(url: str) -> str:
    """Đường dẫn đã che bí mật, dùng cho log."""
    base, _, query = url.partition("?")
    if not query:
        return base

    parts = []
    for kv in query.split("&"):
        name, sep, value = kv.partition("=")
        parts.append(f"{name}={sep and '***'}" if name in _SECRET_PARAMS else kv)
    return f"{base}?{'&'.join(parts)}"


# Mọi lần gọi API đều đi qua đây, kể cả các lần hỏi trạng thái. Danh sách này
# được gom lại để đẩy lên CMS cùng bản ghi chi phí.
#
# Có trần để không phình vô hạn nếu module bị dùng trong một tiến trình sống lâu:
# một clip Veo có thể tốn 60 lần hỏi trạng thái, nhân với nhiều lượt chạy là đáng kể.
_CALLS_MAX = 2000
_calls: list[dict] = []


def http_calls() -> list[dict]:
    """Nhật ký mọi lần gọi API kể từ đầu tiến trình."""
    return list(_calls)


def _request(url: str, *, method: str = "GET", headers: dict | None = None,
             body: dict | None = None, timeout: int = 90, label: str = "") -> dict:
    """Gọi API và GHI LOG dù thành công hay thất bại.

    Không ghi log thì lúc Veo trả về lỗi, tất cả những gì còn lại là một dòng
    `✗ cảnh 3: ...` — không biết mã HTTP, không biết Google nói gì, không biết
    gọi mất bao lâu. Đó đúng là lúc cần dữ liệu nhất.
    """
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, method=method,
                                 headers={"Accept": "application/json", **(headers or {})})
    if data is not None:
        req.add_header("Content-Type", "application/json")

    shown = _safe_url(url)
    tag = f"{label} " if label else ""
    t0 = time.monotonic()

    def record(status, size=0, error=None):
        ms = int((time.monotonic() - t0) * 1000)
        entry = {"method": method, "url": shown, "label": label,
                 "http_status": status, "duration_ms": ms,
                 "bytes": size, "error": error}
        _calls.append(entry)
        if len(_calls) > _CALLS_MAX:
            del _calls[:len(_calls) - _CALLS_MAX]

        # Phân biệt theo MÃ chứ không theo chuỗi lỗi: Google trả 404 với thân
        # rỗng là chuyện thường, mà chuỗi rỗng thì trông y hệt một lần thành công.
        ok = 200 <= (status or 0) < 400
        mark = "↯" if ok else "✗"
        tail = f" · {error}" if error else (f" · {size} B" if ok else " · (thân rỗng)")
        log(f"  {mark} {tag}{method} {shown} → {status} · {ms} ms{tail}")
        return entry

    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8")
            record(resp.status, len(raw))
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:400]
        record(e.code, error=detail)
        raise RuntimeError(f"HTTP {e.code} từ {_safe_url(url).split('?')[0]}: {detail}") from None
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        # Không phản hồi cũng phải có dấu vết: mã 0 nghĩa là chưa từng chạm được
        # tới máy chủ, khác hẳn với việc máy chủ trả về lỗi.
        record(0, error=f"{type(e).__name__}: {e}")
        raise RuntimeError(f"Không gọi được {_safe_url(url).split('?')[0]}: {e}") from None

    return json.loads(raw) if raw.strip() else {}


def _download(url: str, dest: Path, headers: dict | None = None) -> None:
    shown = _safe_url(url)
    t0 = time.monotonic()
    req = urllib.request.Request(url, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            payload = resp.read()
            dest.write_bytes(payload)
            status, size, err = resp.status, len(payload), None
    except Exception as e:
        status, size, err = getattr(e, "code", 0), 0, f"{type(e).__name__}: {e}"
        raise
    finally:
        ms = int((time.monotonic() - t0) * 1000)
        _calls.append({"method": "GET", "url": shown, "label": "tải clip",
                       "http_status": status, "duration_ms": ms, "bytes": size, "error": err})
        mark = "↯" if not err else "✗"
        log(f"  {mark} tải clip {shown} → {status} · {ms} ms · {size} B"
            + (f" · {err}" if err else ""))
    if dest.stat().st_size < 10_000:
        raise RuntimeError(f"File tải về quá nhỏ ({dest.stat().st_size} byte), coi như hỏng")


# ------------------------------------------------------------------- Google Veo

class VeoProvider:
    """Google Veo 3.1 qua Gemini API.

    Luồng: gửi yêu cầu -> nhận một "long-running operation" -> hỏi lại tới khi
    xong -> tải file từ URI trả về (URI này cũng cần khoá API mới tải được).
    """

    name = "veo"

    def __init__(self, conf: dict):
        self.model = conf.get("model") or "veo-3.1-fast-generate-preview"
        self.key = conf["api_key"]
        self.resolution = conf.get("resolution") or "720p"
        self.aspect = conf.get("aspect_ratio") or "9:16"
        self.seconds = int(conf.get("clip_seconds") or 8)
        self.negative = conf.get("negative_prompt") or ""

    @property
    def _headers(self) -> dict:
        return {"x-goog-api-key": self.key}

    def generate(self, prompt: str, dest: Path) -> dict:
        params = {
            "aspectRatio": self.aspect,
            "resolution": self.resolution,
            "durationSeconds": self.seconds,
        }
        if self.negative:
            params["negativePrompt"] = self.negative

        started = _request(
            f"{VEO_BASE}/models/{self.model}:predictLongRunning",
            method="POST", headers=self._headers,
            body={"instances": [{"prompt": prompt}], "parameters": params},
            label="veo/tạo",
        )
        operation = started.get("name")
        if not operation:
            raise RuntimeError(f"Veo không trả về tên tác vụ: {started}")

        deadline = time.time() + POLL_TIMEOUT
        polls = 0
        while time.time() < deadline:
            time.sleep(POLL_INTERVAL)
            polls += 1
            status = _request(f"{VEO_BASE}/{operation}", headers=self._headers,
                              label=f"veo/hỏi#{polls}")
            if not status.get("done"):
                continue
            if "error" in status:
                raise RuntimeError(f"Veo báo lỗi: {status['error']}")

            samples = (status.get("response", {})
                             .get("generateVideoResponse", {})
                             .get("generatedSamples", []))
            if not samples:
                raise RuntimeError(f"Veo trả về rỗng — có thể prompt bị chặn: {status}")

            uri = samples[0]["video"]["uri"]
            _download(uri, dest, self._headers)
            return {"seconds": self.seconds, "url": uri}

        raise RuntimeError(f"Veo quá {POLL_TIMEOUT}s chưa xong")


# ------------------------------------------------------------------------ Kling

class KlingProvider:
    """Kling AI. Xác thực bằng JWT tự ký từ cặp Access Key / Secret Key."""

    name = "kling"

    def __init__(self, conf: dict):
        self.model = conf.get("model") or "kling-v1-6"
        self.access_key = conf["api_key"]
        self.secret_key = conf.get("api_secret") or ""
        if not self.secret_key:
            raise RuntimeError("Kling cần cả Access Key và Secret Key — thiếu Secret Key.")
        self.aspect = conf.get("aspect_ratio") or "9:16"
        self.seconds = int(conf.get("clip_seconds") or 5)
        self.mode = conf.get("mode") or "std"
        self.negative = conf.get("negative_prompt") or ""

    def _jwt(self) -> str:
        """JWT HS256 tự ký — Kling chỉ cần 3 claim, không đáng kéo thêm thư viện."""
        def b64(raw: bytes) -> str:
            return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()

        now = int(time.time())
        header = b64(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
        payload = b64(json.dumps(
            {"iss": self.access_key, "exp": now + 1800, "nbf": now - 5},
            separators=(",", ":")).encode())
        signing = f"{header}.{payload}".encode()
        signature = b64(hmac.new(self.secret_key.encode(), signing, hashlib.sha256).digest())
        return f"{header}.{payload}.{signature}"

    def generate(self, prompt: str, dest: Path) -> dict:
        headers = {"Authorization": f"Bearer {self._jwt()}"}
        body = {
            "model_name": self.model,
            "prompt": prompt[:2500],
            "aspect_ratio": self.aspect,
            "duration": str(self.seconds),
            "mode": self.mode,
        }
        if self.negative:
            body["negative_prompt"] = self.negative[:2500]

        created = _request(f"{KLING_BASE}/v1/videos/text2video", label="kling/tạo",
                           method="POST", headers=headers, body=body)
        if created.get("code") not in (0, None):
            raise RuntimeError(f"Kling từ chối yêu cầu: {created.get('message')}")

        task_id = (created.get("data") or {}).get("task_id")
        if not task_id:
            raise RuntimeError(f"Kling không trả về task_id: {created}")

        deadline = time.time() + POLL_TIMEOUT
        polls = 0
        while time.time() < deadline:
            time.sleep(POLL_INTERVAL)
            # JWT sống 30 phút nhưng ký lại mỗi lần cho chắc, chi phí không đáng kể
            polls += 1
            status = _request(f"{KLING_BASE}/v1/videos/text2video/{task_id}",
                              label=f"kling/hỏi#{polls}",
                              headers={"Authorization": f"Bearer {self._jwt()}"})
            data = status.get("data") or {}
            state = data.get("task_status")

            if state == "succeed":
                videos = (data.get("task_result") or {}).get("videos") or []
                if not videos:
                    raise RuntimeError(f"Kling báo xong nhưng không có video: {data}")
                url = videos[0]["url"]
                _download(url, dest)
                return {"seconds": self.seconds, "url": url}

            if state == "failed":
                raise RuntimeError(f"Kling xử lý thất bại: {data.get('task_status_msg')}")

        raise RuntimeError(f"Kling quá {POLL_TIMEOUT}s chưa xong")


PROVIDERS = {"veo": VeoProvider, "kling": KlingProvider}


# ------------------------------------------------------------------- điều phối

def fetch_config(cfg: dict, channel_id: int | None = None,
                 engine_id: int | None = None) -> dict | None:
    """Hỏi CMS xem có engine AI nào đang bật không.

    engine_id chỉ đích danh engine (khi bấm "Tạo video" và chọn tay trong CMS);
    bỏ trống thì lấy engine của kênh, không có nữa thì lấy engine mặc định.
    """
    conf = cms_config(cfg)
    if not conf["enabled"] or not conf["token"]:
        return None

    params = []
    if channel_id:
        params.append(f"channel={channel_id}")
    if engine_id:
        params.append(f"engine={engine_id}")
    url = f"{conf['url']}/api/pipeline/config"
    if params:
        url += "?" + "&".join(params)
    try:
        data = _request(url, headers={"X-Ingest-Token": conf["token"]}, timeout=15,
                        label="cms/cấu hình")
    except Exception as e:
        log(f"⚠ không lấy được cấu hình engine từ CMS ({e}) — dùng ảnh báo")
        return None

    if data.get("mode") != "ai_clip":
        return None

    # Giữ lại cấu hình gốc và chủ đề để `_report` biết gửi nhật ký đi đâu và
    # gắn vào lượt chạy nào.
    data["_cfg"] = cfg
    data.setdefault("topic", cfg.get("topic"))
    return data


def build_prompt(template: str, scene: dict, date_label: str) -> str:
    """Thay biến trong mẫu prompt của kênh bằng dữ liệu của một tin."""
    values = {
        "tieu_de": scene.get("headline", ""),
        "tom_tat": (scene.get("vo") or "").split(".")[0],
        "nguon": scene.get("source", ""),
        "chu_de": scene.get("topic", ""),
        "so_thu_tu": str(scene.get("index", "")),
        "tong_so": str(scene.get("total", "")),
        "ngay": date_label,
    }
    out = template
    for key, value in values.items():
        out = out.replace("{" + key + "}", strip_emoji(str(value)))
    return " ".join(out.split())


def generate_clips(scenes: list[dict], conf: dict, workdir: Path) -> dict:
    """Sinh một clip cho mỗi cảnh tin. Cảnh nào lỗi thì trả None, dây chuyền tự lùi về ảnh."""
    engine = conf["engine"]
    provider_cls = PROVIDERS.get(engine["provider"])
    if provider_cls is None:
        log(f"⚠ nhà cung cấp lạ: {engine['provider']}")
        return {}

    provider = provider_cls(engine)
    template = conf["channel"]["prompt_template"]
    if conf["channel"].get("negative_prompt"):
        provider.negative = conf["channel"]["negative_prompt"]

    news = [(i, s) for i, s in enumerate(scenes) if s.get("kind") == "news"]
    rate = engine.get("cost_per_second") or 0
    est = len(news) * provider.seconds * rate
    log(f"sinh {len(news)} clip bằng {engine['provider']}/{engine['model']} "
        f"· {provider.seconds}s mỗi clip · ước tính {est:.2f} USD")

    clips: dict[int, dict] = {}

    def one(item):
        idx, scene = item
        prompt = build_prompt(template, scene, conf.get("date_label", ""))
        dest = workdir / f"clip_{idx:02d}.mp4"
        before = len(_calls)
        t0 = time.monotonic()

        try:
            result = provider.generate(prompt, dest)
            ms = int((time.monotonic() - t0) * 1000)
            log(f"  ✓ cảnh {idx}: clip {result['seconds']}s · {ms} ms · "
                f"{len(_calls) - before} lần gọi API")
            out = {"path": dest, "prompt": prompt, "seconds": result["seconds"],
                   "cost": round(result["seconds"] * rate, 4), "url": result.get("url"),
                   "duration_ms": ms, "requests": len(_calls) - before}
        except Exception as e:
            ms = int((time.monotonic() - t0) * 1000)
            log(f"  ✗ cảnh {idx}: {e} · {ms} ms · {len(_calls) - before} lần gọi API")
            # Giữ nguyên `seconds` cả khi hỏng: cần biết đã ĐỊNH gọi bao nhiêu giây
            # mới so được "trượt bao nhiêu tiền" với "tốn bao nhiêu tiền".
            out = {"path": None, "prompt": prompt, "seconds": provider.seconds,
                   "cost": 0.0, "error": str(e),
                   "duration_ms": ms, "requests": len(_calls) - before}

        # Mã HTTP của lần gọi cuối trong lượt này — thứ đầu tiên cần nhìn khi soi lỗi
        mine = _calls[before:]
        out["http_status"] = mine[-1]["http_status"] if mine else None

        # Đẩy lên CMS NGAY, không đợi hết lượt chạy: dây chuyền chết giữa chừng
        # thì bản ghi cuối lượt không bao giờ được gửi, mà đó lại đúng là lần
        # chạy cần soi nhất.
        _report(conf, idx, out, rate)

        return idx, out

    with ThreadPoolExecutor(max_workers=MAX_PARALLEL) as pool:
        for idx, result in pool.map(one, news):
            clips[idx] = result

    made = sum(1 for c in clips.values() if c["path"])
    cost = sum(c["cost"] for c in clips.values())
    log(f"✓ {made}/{len(news)} clip · chi phí thực {cost:.2f} USD")
    return clips


def _entry(conf: dict, idx: int, c: dict, rate: float) -> dict:
    """Một dòng nhật ký gọi API, dùng chung cho gửi ngay và gửi cuối lượt."""
    engine = conf.get("engine") or {}
    return {
        "video_engine_id": engine.get("id"),
        "provider": engine.get("provider"),
        "model": engine.get("model"),
        "resolution": engine.get("resolution"),
        "scene_index": idx,
        "prompt": c.get("prompt"),
        "seconds": c.get("seconds"),
        "cost_per_second": rate or None,
        "cost_usd": c.get("cost") or 0,
        "status": "success" if c.get("path") else "failed",
        "error_message": c.get("error"),
        "clip_url": c.get("url"),
        "http_status": c.get("http_status"),
        "duration_ms": c.get("duration_ms"),
        "requests": c.get("requests"),
    }


def _report(conf: dict, idx: int, c: dict, rate: float) -> None:
    """Gửi một dòng nhật ký lên CMS ngay khi clip xong hoặc hỏng.

    Nuốt mọi lỗi gửi: CMS tắt hay mạng hỏng không được phép làm dừng việc dựng
    video. Bản ghi vẫn còn trong log của tiến trình.
    """
    cms = cms_config(conf.get("_cfg") or {})
    if not cms.get("enabled") or not cms.get("token"):
        return

    payload = {**_entry(conf, idx, c, rate),
               "topic": conf.get("topic"), "run_date": conf.get("run_date")}
    req = urllib.request.Request(
        f"{cms['url']}/api/ingest/generation-call",
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json", "Accept": "application/json",
                 "X-Ingest-Token": cms["token"]},
        method="POST",
    )
    try:
        urllib.request.urlopen(req, timeout=8).read()
    except (urllib.error.URLError, OSError, TimeoutError) as e:
        log(f"  ⚠ không gửi được nhật ký cảnh {idx} lên CMS: {e}")


def call_log(clips: dict, conf: dict, script: dict) -> list[dict]:
    """Gom nhật ký từng lần gọi API để CMS lưu lại chi phí.

    Lấy từ `clips` chứ không lấy từ scenes: cảnh nào gọi hỏng thì không có clip
    nào gắn vào scene, mà đó lại đúng là những lần gọi cần soi nhất.
    """
    rate = (conf.get("engine") or {}).get("cost_per_second") or 0
    return [_entry(conf, idx, clips[idx], rate) for idx in sorted(clips)]
