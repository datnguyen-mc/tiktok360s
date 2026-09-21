# Công thức câu mở đầu (hook)

3 giây đầu quyết định 80% số phận video. Người xem phải nghe xong câu đầu tiên mà
chưa kịp vuốt lên. Dưới đây là các mẫu đã tách theo mục đích, dùng trực tiếp được.

Các mẫu này nằm trong [pipeline/styles.py](../pipeline/styles.py), tách theo giọng văn
(`CHUAN` và `MIEN_TAY`) — thêm mẫu mới vào khoá `hooks` của giọng văn tương ứng là
pipeline tự xoay vòng mỗi ngày.

## Nguyên tắc chung

- **Dưới 12 chữ.** Câu mở dài là câu mở hỏng.
- **Không chào hỏi.** "Xin chào các bạn, hôm nay mình sẽ..." — mất 3 giây vàng vào chỗ trống.
- **Đặt con số lên trước.** "10 tin" cụ thể hơn "những tin", não xử lý nhanh hơn.
- **Hứa một điều cụ thể** rồi giữ đúng lời hứa đó trong video.

## Nhóm 1 — Đếm số (an toàn nhất, dùng cho số điểm tin hằng ngày)

Bản tiếng miền Tây của nhóm này nằm trong `MIEN_TAY["hooks"]` ở
[pipeline/styles.py](../pipeline/styles.py). Ví dụ: *"Mèn đét ơi, bữa nay showbiz có tới
mười chuyện, coi liền cho nóng nghen bà con."*

- "10 tin showbiz nóng nhất hôm nay, gói trong hai phút."
- "Showbiz hôm nay có 10 chuyện, tin cuối gây tranh cãi nhất."
- "Hai phút, 10 tin, biết hết chuyện làng giải trí hôm nay."
- "10 cái tên đang phủ kín mạng xã hội sáng nay."

## Nhóm 2 — Khoảng trống thông tin (hiệu quả cao nhất)

Nêu ra một điều người xem *chưa biết* và ám chỉ rằng họ nên biết.

- "Bạn bỏ lỡ gì ở showbiz hôm nay? Đây là 10 tin đáng chú ý nhất."
- "Chuyện này xảy ra lúc 2 giờ sáng nên phần lớn mọi người còn chưa hay."
- "Có một chi tiết trong tin này ai cũng lướt qua, mình nói ở cuối video."
- "Nếu hôm nay bạn chỉ xem một tin giải trí, thì nên là tin số 3."

## Nhóm 3 — Đặt câu hỏi trực diện

- "Ai là người bị nhắc tên nhiều nhất trên mạng xã hội hôm nay?"
- "Chuyện gì khiến từ khoá này lên đầu tìm kiếm chỉ sau một đêm?"
- "Bạn nghĩ ai đúng trong vụ này? Nghe hết rồi hãy quyết định."

## Nhóm 4 — Mở bằng tin, không mở bằng lời dẫn

Bỏ hẳn phần giới thiệu, nói thẳng tin nóng nhất rồi mới quay lại dẫn dắt.
Đây là kiểu cho tỷ lệ giữ chân giây 3 cao nhất, nên dùng cho tin thật sự nóng.

- "Cô ấy vừa xác nhận chia tay, sau đúng 6 tháng công khai. Và đó mới là tin thứ nhất."
- "Concert bán hết vé trong 4 phút. Chuyện showbiz hôm nay bắt đầu từ đây."

## Nhóm 5 — Mốc thời gian

- "Showbiz ngày 21 tháng 9, có 10 chuyện đáng nói."
- "Trong 12 tiếng qua, làng giải trí có 10 diễn biến mới."
- "Tin sáng nay, cập nhật lúc 7 giờ."

## Câu giữ chân giữa video

Hook chỉ giữ được 3 giây. Đến giây 20–25 là mốc rơi người xem thứ hai, cần một câu neo lại:

- "Tin tiếp theo mới là tin nhiều người tranh cãi nhất."
- "Đến đây thì mọi chuyện rẽ hướng."
- "Còn một tin nữa, và nó liên quan trực tiếp đến tin vừa rồi."

Trong pipeline, từ 6 tin trở lên thì lời dẫn bị bỏ hẳn (mỗi câu "Tin thứ tư" ngốn 3 âm
tiết, nhân 10 tin là mất gần 8 giây) — số thứ tự trên màn hình gánh việc đếm. Câu neo
giữa video vì vậy phải chèn tay vào `script.json` nếu muốn.

## Câu chốt

Câu chốt quyết định lượt bình luận và lượt theo dõi. Luôn kết bằng **một** lời kêu gọi,
đừng gộp nhiều thứ:

- Muốn bình luận → "Bạn quan tâm tin nào nhất? Comment bên dưới."
- Muốn theo dõi → "Theo dõi để mai biết tiếp, mình đăng đều mỗi trưa."
- Muốn xem lại → "Tin số 2 mình có nói kỹ hơn ở video trước."

Gộp cả ba vào một câu thì người xem không làm gì cả.
