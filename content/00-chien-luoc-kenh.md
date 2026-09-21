# Chiến lược kênh — Tin showbiz mỗi ngày

## Định vị

**Một câu:** Kênh điểm tin giải trí cho người bận — hai phút biết hết chuyện showbiz trong ngày.

**Người xem mục tiêu:** 18–34 tuổi, lướt TikTok lúc nghỉ trưa và trước khi ngủ, muốn biết
chuyện đang hot để còn hóng cùng bạn bè nhưng không đủ kiên nhẫn đọc 5 bài báo.

**Điểm khác biệt phải giữ bằng mọi giá:** *nhanh, đủ, không phán xét*. Thị trường đã quá
nhiều kênh "bóc phốt". Chỗ trống là kênh đưa tin gọn gàng, đáng tin, xem xong không thấy mệt.

**Về giọng miền Tây:** đây là lựa chọn định vị, không phải trò bắt chước. Viết thân mật,
dùng từ địa phương tự nhiên như người bản xứ nói với nhau — đừng nhại giọng để gây cười.
Khán giả miền Tây là nhóm xem TikTok rất lớn, và họ nhận ra ngay đâu là thật đâu là diễn.

**Ba thứ không làm** — đây là ranh giới giữ kênh sống lâu:
- Không dựng chuyện, không giật tít sai sự thật so với nguồn.
- Không đưa tin đời tư chưa kiểm chứng như thể đã xác nhận (luôn nói "theo [nguồn]").
- Không khai thác tin tang thương, bệnh tật, tai nạn để lấy view.

## 5 trụ nội dung

| Trụ | Tần suất | Định dạng | Vai trò |
|---|---|---|---|
| **Điểm tin hằng ngày** | 7 số/tuần | 90–120s, 10 tin | Xương sống, kéo người xem quay lại mỗi ngày |
| **Tin nóng lẻ** | khi có | 20–35s, 1 tin | Bắt sóng lúc tin vừa nổ, dễ lên xu hướng nhất |
| **Giải thích drama** | 2 số/tuần | 60–90s | Giữ người xem lâu, tăng chỉ số hoàn thành |
| **Bảng xếp hạng** | 1 số/tuần | 45–60s | Dễ viral, dễ tạo tranh luận ở phần bình luận |
| **Nhìn lại** | 1 số/tuần | 45–60s | Nội dung không hết hạn, đăng lại được |

Pipeline trong repo này tự động hoá **trụ số 1**. Bốn trụ còn lại viết tay rồi render lại
bằng cùng bộ công cụ (xem `make rerender` trong [README](../README.md)).

## Nhịp đăng

| Khung giờ | Vì sao | Đăng gì |
|---|---|---|
| **11:30 – 12:30** | giờ nghỉ trưa, lượt lướt cao nhất trong ngày | số điểm tin chính |
| **19:30 – 21:30** | khung vàng buổi tối | tin nóng lẻ hoặc giải thích drama |
| **07:00 – 08:00** | nhóm dậy sớm, cạnh tranh thấp | đăng lại bài tốt nhất tuần trước |

Chạy pipeline lúc 7:30 sáng, duyệt nhanh rồi hẹn giờ đăng 11:30 — vừa kịp tin mới,
vừa có thời gian sửa nếu máy chọn nhầm tin.

## Chỉ số cần theo

Đừng nhìn lượt xem. Ba con số quyết định kênh sống hay chết:

1. **Tỷ lệ xem hết** — mục tiêu ≥ 30% cho video 2 phút (video càng dài ngưỡng càng thấp).
   Dưới 20% là hook hoặc nhịp có vấn đề. So sánh giữa các video của chính mình, đừng so với kênh khác.
2. **Giữ chân ở giây thứ 3** — mục tiêu ≥ 75%. Dưới ngưỡng này thì phải đổi câu mở đầu.
3. **Bình luận / lượt xem** — mục tiêu ≥ 0,5%. Thấp nghĩa là nội dung chưa gợi được tranh luận.

Mỗi tuần mở TikTok Analytics một lần, ghi lại 3 số này cho từng video, đối chiếu với tin
đã chọn. Sau 4 tuần sẽ thấy rõ loại tin nào kéo được người xem trên chính kênh của mình —
lúc đó cập nhật `hot_keywords` trong `config.json` theo dữ liệu thật.

## Lộ trình 90 ngày

- **Tuần 1–2 — chuẩn hoá.** Đăng đều 1 số/ngày, cùng khung giờ. Chưa cần đẹp, cần đều.
  Mục tiêu duy nhất: chốt được nhịp sản xuất chạy trơn.
- **Tuần 3–6 — tìm chất riêng.** Thử 3 kiểu hook khác nhau, mỗi kiểu 5 số. Giữ kiểu có
  chỉ số giữ chân giây 3 cao nhất. Bắt đầu chèn tin nóng lẻ khi có biến.
- **Tuần 7–12 — nhân rộng.** Tăng lên 2 số/ngày, thêm trụ giải thích drama.
  Lúc này mới tính chuyện đặt nhạc hiệu riêng, hình hiệu mở đầu, và giọng đọc thật nếu muốn.

Điều dễ sai nhất ở giai đoạn đầu là dừng đăng khi chưa thấy kết quả. Thuật toán cần vài
tuần dữ liệu mới hiểu kênh đang phục vụ ai.
