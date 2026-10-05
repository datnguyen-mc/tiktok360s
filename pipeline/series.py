"""Sinh kịch bản phim nhiều tập bằng Gemini, mỗi ngày một tập.

Khác hẳn hai kênh tin: không có nguồn RSS nào chảy vào. Mỗi ngày AI đọc tập hôm
trước rồi viết tập kế tiếp — như một series thật, nhân vật và mạch chuyện phải
nối liền qua từng tập.

Ba thứ giữ cho mạch chuyện không đứt:

  1. `series.nhan_vat` và `series.phong_cach` trong topics/<slug>.json là bản mô
     tả GỐC, chép nguyên văn vào prompt mỗi lần. Model không nhớ gì giữa các lần
     gọi; đổi một chữ trong mô tả là sang tập sau con chó đã khác con chó.
  2. Tập trước được đọc lại từ CMS (hoặc từ tệp đã lưu nếu CMS tắt) và đưa vào
     prompt. Không có nó thì tập nào cũng như tập một.
  3. `series.dan_bai` là khung 40 tập đã vạch sẵn. AI bám theo khung chứ không
     tự bịa hướng đi — hết khung mới được viết tiếp tự do.

Kết quả trả về có cùng hình dạng với tin lấy từ RSS (`headline` + `summary`), nên
mọi khâu phía sau — dựng kịch bản, giọng đọc, sinh cảnh, ghép video — dùng lại
nguyên vẹn, không phải sửa gì.
"""
from __future__ import annotations

import json
import re
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

from . import llm
from .cms import config as cms_config
from .common import chua_cum, log, step



# ─────────────────────────────────────────────────────────── gọi API có ghi log

def api_key(cfg: dict) -> str:
    """Khoá Gemini, giữ cho mã cũ gọi tới. Uỷ quyền cho llm.api_key."""
    return llm.api_key(cfg, "gemini")


def last_episode(cfg: dict) -> dict | None:
    """Tập gần nhất đã sinh — lấy từ CMS, đối chiếu với tệp trên đĩa.

    Luôn đối chiếu cả hai và lấy tập CAO HƠN. Lý do: nếu lần trước CMS không
    nhận được (mạng hỏng, CMS đang khởi động lại) thì tập chỉ nằm trên đĩa, CMS
    trả về `null`, và hôm sau series sẽ âm thầm quay về tập 1 — ghi đè lên tập
    cũ và làm đứt cả mạch chuyện mà không có lỗi nào hiện ra.
    """
    topic = cfg.get("topic", "")
    tren_dia = _last_from_disk(topic)
    tu_cms = None

    conf = cms_config(cfg)
    if conf["enabled"] and conf["token"]:
        try:
            req = urllib.request.Request(
                f"{conf['url']}/api/pipeline/series/{topic}/last",
                headers={"X-Ingest-Token": conf["token"], "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                tu_cms = json.loads(resp.read().decode("utf-8")).get("episode")
        except Exception as e:
            log(f"  ⚠ không đọc được tập trước từ CMS ({e}) — dùng tệp trên đĩa")

    so = lambda e: int((e or {}).get("so_tap") or 0)

    if so(tren_dia) > so(tu_cms):
        if tu_cms is not None or tren_dia:
            log(f"  ⚠ CMS mới có tới tập {so(tu_cms)} nhưng trên đĩa đã có tập "
                f"{so(tren_dia)} — dùng tập trên đĩa để không viết trùng")
        return tren_dia

    return tu_cms


def _last_from_disk(topic: str) -> dict | None:
    """Tập có SỐ LỚN NHẤT trong output/<topic>/.

    Duyệt theo số tập chứ không theo tên thư mục ngày: kênh ra nhiều tập mỗi
    ngày nên ngày mới nhất chứa nhiều tập, và thứ tự chữ cái của thư mục không
    cho biết tập nào là mới nhất.
    """
    root = Path("output") / topic
    if not root.exists():
        return None

    moi_nhat = None
    for f in list(root.glob("*/episode.json")) + list(root.glob("*/*/episode.json")):
        try:
            ep = json.loads(f.read_text(encoding="utf-8"))
        except Exception:
            continue
        if int(ep.get("so_tap") or 0) > int((moi_nhat or {}).get("so_tap") or 0):
            moi_nhat = ep
    return moi_nhat


def save_episode(cfg: dict, episode: dict, outdir: Path) -> None:
    """Lưu tập vừa sinh: ra tệp (luôn luôn) và lên CMS (nếu bật)."""
    outdir.mkdir(parents=True, exist_ok=True)
    (outdir / "episode.json").write_text(
        json.dumps(episode, ensure_ascii=False, indent=2), encoding="utf-8")

    conf = cms_config(cfg)
    if not conf["enabled"] or not conf["token"]:
        return

    payload = {**episode, "topic": cfg.get("topic")}
    req = urllib.request.Request(
        f"{conf['url']}/api/ingest/series-episode",
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json", "Accept": "application/json",
                 "X-Ingest-Token": conf["token"]},
        method="POST")
    try:
        urllib.request.urlopen(req, timeout=15).read()
    except Exception as e:
        log(f"  ⚠ không lưu được tập lên CMS: {e}")


# ───────────────────────────────────────────────────────────────────── prompt

def _outline(cfg: dict, so_tap: int) -> dict | None:
    for e in cfg.get("series", {}).get("dan_bai") or []:
        if e.get("so") == so_tap:
            return e
    return None


def next_items(cfg: dict, n: int) -> tuple[list[dict], int, int] | None:
    """Hỏi CMS các mục kế tiếp chưa lên video.

    Trả về (mục, đã dùng, tổng) — hoặc None nếu CMS không trả lời được, lúc đó
    người gọi quay về đọc `dan_bai` trong file.
    """
    conf = cms_config(cfg)
    if not conf["enabled"] or not conf["token"]:
        return None

    topic = cfg.get("topic", "")
    try:
        req = urllib.request.Request(
            f"{conf['url']}/api/pipeline/series/{topic}/next?n={n}",
            headers={"X-Ingest-Token": conf["token"], "Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            d = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        log(f"  ⚠ không hỏi được lộ trình từ CMS ({e}) — dùng dan_bai trong file")
        return None

    return d.get("items") or [], int(d.get("da_dung") or 0), int(d.get("tong") or 0)


def _per_episode(cfg: dict, seed: int) -> int:
    """Mỗi tập lấy bao nhiêu mục dàn bài.

    Khai một số thì cố định; khai [3, 5] thì mỗi ngày một khác trong khoảng đó —
    để các tập không dài y hệt nhau, người xem đỡ thấy máy móc.
    """
    v = cfg.get("series", {}).get("moi_tap") or 1
    if isinstance(v, (list, tuple)) and len(v) == 2:
        lo, hi = int(v[0]), int(v[1])
        return lo + (seed % max(1, hi - lo + 1))
    return max(1, int(v))


def _tiep_theo(cfg: dict, da_dung: int, muc: list[dict], so_tap: int) -> list[dict]:
    """Các mục của tập SAU, để câu chốt gọi đúng tên chứ không đoán."""
    tu_db = next_items(cfg, len(muc) + _per_episode(cfg, so_tap + 1))
    if tu_db is not None and tu_db[2] > 0:
        # Endpoint trả về từ mục chưa dùng đầu tiên, nên phải bỏ qua phần của tập này
        return tu_db[0][len(muc):]
    return _slice(cfg, da_dung + len(muc), so_tap + 1)


def _slice(cfg: dict, da_dung: int, seed: int) -> list[dict]:
    """Các mục dàn bài dành cho tập này, tính từ chỗ tập trước dừng lại."""
    dan_bai = cfg.get("series", {}).get("dan_bai") or []
    n = _per_episode(cfg, seed)
    return dan_bai[da_dung:da_dung + n]


def _part_name(cfg: dict, so_tap: int) -> str:
    for p in cfg.get("series", {}).get("phan") or []:
        if p.get("tu", 0) <= so_tap <= p.get("den", 0):
            return p.get("ten", "")
    return ""


def build_catalog_prompt(cfg: dict, so_tap: int, muc: list[dict],
                         previous: dict | None, da_dung: int, tong: int,
                         tiep_theo: list[dict] | None = None) -> str:
    """Prompt cho series dạng danh mục: mỗi tập điểm qua vài mục.

    Khác series kể chuyện ở chỗ không có mạch truyện nối tiếp — thứ phải nối là
    GIỌNG và CÁCH TRÌNH BÀY, cộng một câu mở nhắc tập trước đã nói tới đâu.
    """
    s = cfg.get("series", {})
    n_canh = int(s.get("so_canh") or 8)
    canh_moi_muc = max(1, n_canh // max(1, len(muc)))

    # Mỗi kênh series nói về một loại đối tượng khác nhau — câu lạc bộ, vùng đất,
    # nhân vật. Từ ngữ và nhãn các trường lấy từ cấu hình, không gắn cứng vào đây,
    # nếu không thêm kênh nào cũng phải sửa hàm này.
    hs = s.get("ho_so") or {}
    don_vi = hs.get("don_vi", "câu lạc bộ")
    linh_vuc = hs.get("linh_vuc", "tư liệu bóng đá")
    nhom_nhan = hs.get("nhom_nhan", "Giải")
    truong = hs.get("truong") or [
        {"khoa": "nam", "nhan": "Thành lập"},
        {"khoa": "san", "nhan": "Sân nhà"},
        {"khoa": "danh_hieu", "nhan": "Danh hiệu"},
    ]

    mot = len(muc) == 1

    def _mo_ta(m: dict) -> str:
        """Dữ kiện đã biết về một mục — model dùng cái này thay vì tự nhớ."""
        dong = [f"  Tên: {m.get('ten')}"]
        if m.get("giai"):
            dong.append(f"  {nhom_nhan}: {m['giai']}")
        for t in truong:
            if m.get(t["khoa"]):
                dong.append(f"  {t['nhan']}: {m[t['khoa']]}")
        if m.get("dau_an"):
            dong.append(f"  Dấu ấn: {m['dau_an']}")
        if m.get("ghi_chu"):
            dong.append(f"  Ghi chú: {m['ghi_chu']}")
        return "\n".join(dong)

    ds = "\n\n".join(_mo_ta(m) for m in muc)

    truoc = (
        f"Tập trước (tập {previous.get('so_tap')}) đã nói về: {previous.get('tom_tat', '')}\n"
        if previous else "Đây là tập đầu tiên của series.\n"
    )

    # Đưa đúng danh sách tập sau vào prompt. Không đưa thì model tự đoán, và câu
    # mời xem tập sau sẽ hứa nhầm đội — khán giả quay lại thấy sai ngay.
    sau = ", ".join(m.get("ten", "") for m in (tiep_theo or []))

    sau_text = (f"Tập sau nói về: {sau}. Nhắc đúng những tên này, không đoán."
                if sau else f"Không nêu tên {don_vi} cụ thể vì đây là tập cuối của danh sách.")

    if mot and hs.get("dan_dat"):
        cach_viet = hs["dan_dat"].format(n_canh=n_canh, don_vi=don_vi)
    elif mot:
        # Cả video dành cho một đội thì có chỗ kể sâu: không liệt kê danh hiệu
        # khô khan mà dựng thành một mạch từ ngày thành lập tới hôm nay.
        cach_viet = f"""- Cả {n_canh} cảnh dành trọn cho MỘT câu lạc bộ này, kể theo mạch thời gian
  từ ngày thành lập tới năm 2026. Phân bổ đại khái:
    · 1 cảnh mở, gọi tên câu lạc bộ và một câu định vị vị thế
    · 2 cảnh: ra đời, tên gốc, hoàn cảnh thành lập
    · 2 cảnh: sân nhà, sức chứa, biệt danh, màu áo, bầu không khí khán đài
    · 3 cảnh: giai đoạn hoàng kim, các danh hiệu lớn kèm SỐ LẦN vô địch
    · 2 cảnh: những con người và khoảnh khắc làm nên tên tuổi — huyền thoại,
      trận đấu để đời, biến cố, kình địch
    · 1 cảnh: giai đoạn GẦN ĐÂY, tính tới năm 2026
    · 1 cảnh chốt
- Phần "Dấu ấn" ở trên đã liệt kê sẵn các mốc. Rải chúng vào các cảnh tương ứng,
  KHÔNG dồn hết vào một cảnh và KHÔNG bỏ sót mốc gần đây.
- Mỗi cảnh nói một ý riêng. Không lặp lại ý của cảnh trước bằng từ khác."""
    else:
        cach_viet = f"""- Tổng {n_canh} cảnh, chia đều cho {len(muc)} câu lạc bộ (khoảng {canh_moi_muc} cảnh mỗi CLB).
- Mỗi câu lạc bộ phải nêu được: năm thành lập, sân nhà, và những danh hiệu lớn
  nhất kèm SỐ LẦN vô địch."""

    return f"""Bạn viết kịch bản video ngắn TikTok tiếng Việt cho một series {linh_vuc}.

SERIES: {cfg.get('topic_name') or cfg.get('name')}
{cfg.get('description', '')}

{truoc}
TẬP {so_tap} nói về {don_vi if mot else f'{len(muc)} {don_vi}'} sau (đã đi được {da_dung}/{tong}):
{ds}

CÁCH VIẾT
{cach_viet}
- Mỗi cảnh có hai phần:
    "headline": mô tả HÌNH ẢNH nhìn thấy được. Một câu ngắn tiếng Việt. Đây là
                chỉ dẫn cho máy vẽ hình, không hiện lên màn hình.
    "nhan":     nhãn NGẮN hiện trên màn hình, 3–6 chữ, nêu ý chính của cảnh.
                Ví dụ: "Thành lập năm 1878", "Thánh địa Old Trafford",
                "20 lần vô địch nước Anh".
    "vo":       lời dẫn 20–30 chữ, giọng nam trầm, chắc, có nhịp. Không đùa cợt.
                Viết đủ ý, đừng cụt — cả video phải đạt 90 tới 120 giây.
- Cảnh đầu tiên là câu mở, gọi đúng tên {don_vi} ngay từ đầu.
- Cảnh cuối chốt bằng câu mời xem tập sau. {sau_text}

ĐỘ CHÍNH XÁC — QUAN TRỌNG NHẤT
- Mọi dữ kiện và mốc dấu ấn đã cho sẵn ở trên. DÙNG ĐÚNG những dữ kiện đó:
  không sửa số, không làm tròn, không thêm sự kiện nào ngoài danh sách.
- Chi tiết nào KHÔNG có trong danh sách thì chỉ nêu nếu bạn chắc chắn đúng;
  không chắc thì bỏ qua. Thà thiếu còn hơn sai.
- Tuyệt đối không bịa sự kiện sau năm 2026.
- Đây là nội dung về đối tượng có thật, sai số liệu là mất uy tín cả kênh.

TRẢ VỀ ĐÚNG MỘT KHỐI JSON, không kèm giải thích, không kèm dấu ```:
{{
  "so_tap": {so_tap},
  "tieu_de": "tên tập, nêu rõ tên {don_vi}",
  "tom_tat": "một câu tóm tắt nội dung tập này",
  "cau_chot": "câu mời xem tập sau",
  "trang_thai": "đã đi tới đâu, còn bao nhiêu",
  "canh": [
    {{"headline": "...", "vo": "..."}}
  ]
}}"""


def next_no(cfg: dict) -> int:
    """Số tập kế tiếp. Cần biết TRƯỚC khi chạy để đặt tên thư mục và định danh
    lượt chạy — kênh series ra nhiều video mỗi ngày, thiếu số tập là chúng ghi
    đè lên nhau."""
    previous = last_episode(cfg)
    return (previous.get("so_tap", 0) + 1) if previous else 1


def videos_per_day(cfg: dict, seed: int = 0) -> int:
    """Mỗi ngày ra bao nhiêu video. Khai [3, 5] thì mỗi ngày một khác."""
    v = cfg.get("series", {}).get("videos_moi_ngay") or 1
    if isinstance(v, (list, tuple)) and len(v) == 2:
        lo, hi = int(v[0]), int(v[1])
        return lo + (seed % max(1, hi - lo + 1))
    return max(1, int(v))


def build_prompt(cfg: dict, so_tap: int, previous: dict | None) -> str:
    s = cfg.get("series", {})
    n_canh = int(s.get("so_canh") or 8)

    nhan_vat = "\n".join(f"  · {v}" for v in (s.get("nhan_vat") or {}).values())
    outline = _outline(cfg, so_tap)
    part = _part_name(cfg, so_tap)

    # Tập trước: chỉ đưa phần cần cho mạch chuyện, không đưa nguyên kịch bản —
    # prompt dài không làm truyện hay hơn, chỉ làm model lạc trọng tâm.
    if previous:
        truoc = (
            f"TẬP TRƯỚC (tập {previous.get('so_tap')} — “{previous.get('tieu_de')}”)\n"
            f"  Tóm tắt: {previous.get('tom_tat', '')}\n"
            f"  Câu chốt bỏ lửng: {previous.get('cau_chot', '')}\n"
            f"  Trạng thái nhân vật sau tập: {previous.get('trang_thai', '')}\n"
        )
    else:
        truoc = "Đây là TẬP ĐẦU TIÊN — chưa có tập trước.\n"

    if outline:
        khung = (
            f"KHUNG ĐÃ VẠCH SẴN cho tập {so_tap} — bám theo, không đổi hướng:\n"
            f"  Tên tập: {outline['ten']}\n"
            f"  Mở: {outline['hook']}\n"
            f"  Diễn biến: {outline['nhip']}\n"
            f"  Chốt: {outline['chot']}\n"
        )
    else:
        khung = (
            f"Hết khung đã vạch. Tự viết tiếp tập {so_tap}, giữ nguyên nhân vật, "
            f"bối cảnh và giọng kể. Mỗi tập phải có một chuyện trọn vẹn trong tập.\n"
        )

    return f"""Bạn viết kịch bản cho một series hoạt hình ngắn trên TikTok, tiếng Việt.

SERIES: {cfg.get('topic_name') or cfg.get('name')}
{cfg.get('description', '')}
{f'Phần hiện tại: {part}' if part else ''}

NHÂN VẬT (giữ nguyên tính cách và ngoại hình qua mọi tập):
{nhan_vat}

BỐI CẢNH VÀ PHONG CÁCH:
{s.get('phong_cach', '')}

{truoc}
{khung}

YÊU CẦU
- Viết đúng {n_canh} cảnh. Mỗi cảnh là một clip 8 giây.
- Mỗi cảnh có hai phần:
    "headline": mô tả HÀNH ĐỘNG NHÌN THẤY ĐƯỢC, bằng tiếng Việt, một câu ngắn.
                Đây là thứ đưa cho AI vẽ hình, nên phải tả được bằng mắt:
                ai đang làm gì, ở đâu. Không tả cảm xúc trừu tượng.
    "vo":       lời kể của người dẫn, 12–22 chữ, giọng ấm áp, gần gũi, miền Nam.
- Cảnh đầu nhắc lại mạch chuyện tập trước bằng một câu tự nhiên.
- Cảnh cuối chốt bằng một câu BỎ LỬNG khiến người xem muốn coi tập sau.
- Không dùng bi kịch nặng (bệnh nan y, tai nạn, chết chóc). Đây là kênh ấm áp.
- Không để nhân vật đổi tính nết cho tiện kịch bản.

TRẢ VỀ ĐÚNG MỘT KHỐI JSON, không kèm giải thích, không kèm dấu ```:
{{
  "so_tap": {so_tap},
  "tieu_de": "tên tập, ngắn gọn",
  "tom_tat": "một câu tóm tắt chuyện xảy ra trong tập này",
  "cau_chot": "câu bỏ lửng ở cuối tập",
  "trang_thai": "quan hệ và hoàn cảnh hai nhân vật sau tập này, một câu",
  "canh": [
    {{"headline": "...", "vo": "..."}}
  ]
}}"""


# ───────────────────────────────────────────────────────────────────── sinh tập

def _parse(text: str) -> dict:
    """Bóc JSON khỏi câu trả lời.

    Model thường bọc JSON trong ```json … ``` dù đã dặn đừng. Cắt trước khi
    parse, và nếu vẫn hỏng thì tìm khối {...} dài nhất.
    """
    t = text.strip()
    t = re.sub(r"^```(?:json)?\s*", "", t)
    t = re.sub(r"\s*```$", "", t)

    for candidate in (t, (re.search(r"\{.*\}", t, re.S) or _Empty()).group(0) if "{" in t else ""):
        if not candidate:
            continue
        try:
            return json.loads(candidate)
        except json.JSONDecodeError as e:
            last = e

    # Chỉ ra ĐÚNG chỗ hỏng. Lỗi hay gặp là dấu ngoặc kép chưa thoát trong lời
    # thoại tiếng Việt — nhìn 200 ký tự quanh đó là thấy ngay, còn in cả 4000
    # ký tự thì không ai đọc.
    pos = getattr(last, "pos", 0)
    quanh = t[max(0, pos - 100):pos + 100]
    raise RuntimeError(
        f"Gemini trả về JSON hỏng ({last.msg} tại ký tự {pos}):\n"
        f"  …{quanh}…"
    ) from None


class _Empty:
    """Chỗ giữ khi regex không khớp, để vòng lặp trên khỏi phải kiểm tra None."""

    @staticmethod
    def group(_):
        return ""


def generate(cfg: dict, date: str | None = None) -> tuple[list[dict], dict]:
    """Sinh tập kế tiếp. Trả về (items giống tin RSS, bản ghi tập).

    items dùng chung hình dạng với tin lấy từ RSS để mọi khâu phía sau không
    phải biết tập này đến từ đâu.
    """
    s = cfg.get("series", {})
    step("B1 · Viết tập mới bằng AI")

    previous = last_episode(cfg)
    so_tap = (previous.get("so_tap", 0) + 1) if previous else 1

    tong = int(s.get("tong_so_tap") or 0)
    if previous:
        log(f"tập trước: {previous.get('so_tap')} — “{previous.get('tieu_de')}”")
    else:
        log("chưa có tập nào — bắt đầu từ tập 1")

    # Series dạng danh mục: mỗi tập gom vài mục, nên phải nhớ đã đi tới đâu chứ
    # không suy ra được từ số tập (mỗi tập lấy 3–5 mục, không cố định).
    dan_bai = s.get("dan_bai") or []
    nhieu_muc = bool(s.get("moi_tap"))
    muc: list[dict] = []
    da_dung = int(previous.get("da_dung") or 0) if previous else 0
    tong_muc = len(dan_bai)

    if nhieu_muc:
        n = _per_episode(cfg, so_tap)

        # Lộ trình trong cơ sở dữ liệu là nguồn chính: nó nhớ được mục nào đã
        # lên video. File topics/ chỉ là phương án dự phòng khi CMS không trả lời.
        tu_db = next_items(cfg, n)
        if tu_db is not None and tu_db[2] > 0:
            muc, da_dung, tong_muc = tu_db
            nguon = "CSDL"
        else:
            muc = _slice(cfg, da_dung, so_tap)
            nguon = "file"

        if not muc:
            raise RuntimeError(
                f"Đã đi hết {tong_muc} mục trong lộ trình của “{cfg.get('topic_name')}”.\n"
                f"  Thêm mục mới trong CMS (trang Chủ đề kênh), hoặc thêm vào "
                f"topics/{cfg.get('topic')}.json rồi chạy: php artisan series:import {cfg.get('topic')}"
            )

        log(f"viết tập {so_tap} · {len(muc)} mục "
            f"({da_dung + 1}–{da_dung + len(muc)}/{tong_muc}) · lộ trình từ {nguon}")
        for m in muc:
            log(f"  · {m.get('ten')}")
    else:
        log(f"viết tập {so_tap}" + (f"/{tong}" if tong else ""))

    prompt = (build_catalog_prompt(cfg, so_tap, muc, previous, da_dung, len(dan_bai),
                                   _tiep_theo(cfg, da_dung, muc, so_tap))
              if nhieu_muc else build_prompt(cfg, so_tap, previous))

    # Gemini hay OpenAI do `series.provider` quyết — xem pipeline/llm.py.
    # Nhiệt 0.9: đủ ngẫu nhiên để hai tập không giống nhau, đủ thấp để bám khung.
    text, model = llm.sinh_json(prompt, cfg, nhiet=0.9)

    try:
        ep = _parse(text)
    except RuntimeError as e:
        log(f"  ⚠ {e}")
        log("  thử lại một lần với nhiệt độ thấp hơn…")
        # Thấp hơn để model bám sát khuôn JSON thay vì sáng tạo
        text, model = llm.sinh_json(prompt, cfg, nhiet=0.4)
        ep = _parse(text)

    canh = ep.get("canh") or []
    if not canh:
        raise RuntimeError(f"Tập sinh ra không có cảnh nào: {json.dumps(ep, ensure_ascii=False)[:300]}")

    ep["so_tap"] = so_tap
    ep["ngay"] = date or datetime.now().strftime("%Y-%m-%d")
    ep["model"] = model
    if nhieu_muc:
        ep["da_dung"] = da_dung + len(muc)
        ep["muc"] = [m.get("ten") for m in muc]
        ep["tong_muc"] = tong_muc

    log(f"✓ tập {so_tap} — “{ep.get('tieu_de')}” · {len(canh)} cảnh")
    log(f"  chốt: {ep.get('cau_chot', '')}")

    # Đổ về hình dạng của tin RSS để các khâu sau dùng lại được nguyên vẹn
    now = datetime.now().isoformat()
    # Dữ kiện của mục đang nói tới, gắn vào mọi cảnh: khâu dựng hình lấy đây để
    # vẽ bảng thông tin thay vì để trống một nền chuyển màu.
    the = {}
    if nhieu_muc and len(muc) == 1:
        m = muc[0]
        the = {k: m[k] for k in ("ten", "giai", "nam", "san", "danh_hieu") if m.get(k)}

    # Bảng thông tin đứng yên suốt video thì người xem hết nhìn sau năm giây.
    # Mỗi cảnh làm nổi dòng đang được nói tới.
    #
    # Chọn theo NỘI DUNG chứ không theo vị trí cảnh: chia theo vị trí thì cảnh
    # thứ ba luôn nhấn "sân nhà" kể cả khi nó đang kể về danh hiệu, và người xem
    # thấy ngay là chữ với hình nói hai chuyện khác nhau.
    # Từ khoá nhận dạng do kênh tự khai: mỗi kênh nói về một loại đối tượng nên
    # bộ từ khác nhau. Mặc định là bộ của kênh bóng đá.
    MAC_DINH = {
        "danh_hieu": ["vô địch", "danh hiệu", "cúp", "chức vô địch", "đăng quang",
                      "nâng cao", "champions league", "fa cup", "scudetto",
                      "ăn ba", "kỷ lục"],
        "san": ["sân", "thánh địa", "khán đài", "chảo lửa", "pháo đài"],
        "nam": ["thành lập", "ra đời", "khai sinh", "tiền thân", "khởi nguồn"],
    }
    tu_khoa = (cfg.get("series", {}).get("ho_so") or {}).get("dau_hieu") or MAC_DINH
    DAU_HIEU = tuple(tu_khoa.items())

    def _noi_bat(c: dict, i: int, n: int) -> str | None:
        if n <= 2 or i == 0:
            return None            # cảnh mở: hiện cả bảng, chưa nhấn gì
        text = f"{c.get('nhan', '')} {c.get('vo', '')}".lower()
        for khoa, tu in DAU_HIEU:
            if any(chua_cum(text, t) for t in tu):
                return khoa
        return None

    items = [{
        "title": c.get("nhan") or c.get("headline", ""),
        "headline": c.get("headline", ""),
        "nhan": c.get("nhan") or "",
        "noi_bat": _noi_bat(c, i, len(canh)),
        "summary": c.get("vo", ""),
        "sentences": [c.get("vo", "")],
        "source": ep.get("tieu_de", ""),
        "link": "",
        "published": now,
        "score": 100.0 - i,          # giữ nguyên thứ tự cảnh khi xếp hạng
        "image": None,
        "the_thong_tin": the or None,
    } for i, c in enumerate(canh)]

    return items, ep
