"""Giọng văn kịch bản — đọc từ cấu hình chủ đề, không gắn cứng trong code.

Mọi nội dung riêng của chủ đề (câu mở, lời dẫn, câu cảm thán, nhóm từ khoá) nằm
trong topics/<slug>.json. File này chỉ là phần máy móc: chọn giọng văn, xếp tin
vào nhóm, và quyết định tin nào được phép chèn câu đùa.

Thêm chủ đề mới chỉ cần thêm một file JSON — xem topics/bongda.json làm mẫu.

Lưu ý: edge-tts **không có giọng vùng miền**. Chất miền Tây trong các mẫu câu là
do cách dùng từ, không phải ngữ âm.
"""
from __future__ import annotations

from .common import no_accent

# Giọng văn tối thiểu, dùng khi file chủ đề không khai gì — để dây chuyền không
# bao giờ chết vì thiếu cấu hình.
FALLBACK = {
    "ten": "chuẩn",
    "hooks": ["Hôm nay có {n} tin đáng chú ý, gói gọn {dur}."],
    "connectors": ["Đầu tiên", "Tin thứ hai", "Tiếp theo", "Chuyện thứ tư", "Tin thứ năm"],
    "connector_cuoi": "Và cuối cùng",
    "reactions": {},
    "outros": ["Theo dõi để cập nhật mỗi ngày."],
    "tieu_de_intro": "{n} TIN NÓNG NHẤT HÔM NAY",
    "tieu_de_outro": "THEO DÕI ĐỂ XEM TIẾP NGÀY MAI",
}


def get(cfg: dict) -> dict:
    """Giọng văn đang chọn của chủ đề."""
    styles = cfg.get("styles") or {}
    name = cfg.get("script", {}).get("style", "chuan")
    return {**FALLBACK, **(styles.get(name) or styles.get("chuan") or {})}


def cho_phep_pha_tro(cfg: dict, tieu_de: str) -> bool:
    """Tin này có hợp để chèn câu cảm thán vui không?

    Danh sách chặn khai trong topics/<slug>.json, khoá `khong_pha_tro`, viết
    không dấu vì so khớp trên bản đã bỏ dấu.
    """
    chan = cfg.get("khong_pha_tro") or []
    s = no_accent(tieu_de or "").lower()
    return not any(k in s for k in chan)


def nhom_cua(cfg: dict, tieu_de: str, sapo: str = "") -> str:
    """Xếp tin vào nhóm để chọn câu cảm thán cho hợp cảnh.

    Thứ tự các nhóm trong file cấu hình CÓ Ý NGHĨA: nhóm đứng trước được xét
    trước. Đặt nhóm tiêu cực (tranh cãi, chấn thương) lên đầu để một tin vừa có
    "vô địch" vừa có "tranh cãi" không bị chúc mừng nhầm.
    """
    s = no_accent(f"{tieu_de} {sapo}").lower()
    for ten, tu_khoa in cfg.get("nhom_tu_khoa") or []:
        if any(k in s for k in tu_khoa):
            return ten
    return "chung"
