# Kịch bản mẫu

Tất cả mẫu dưới đây đã canh theo tốc độ đọc thực đo của giọng `vi-VN-HoaiMyNeural`
ở rate `+25%`: **khoảng 4,5 âm tiết/giây**, tức **370–500 âm tiết cho một video 90–120s
gồm 10 tin**. Không cần nhẩm tay — `make calibrate` in ra con số đúng với cấu hình
hiện tại của bạn.

> Các chỗ trong ngoặc vuông `[...]` là chỗ điền. Mẫu cố tình không gắn tên người thật —
> điền từ tin đã kiểm chứng của ngày hôm đó, và luôn giữ cụm "theo [nguồn]" khi thông tin
> chưa được người trong cuộc xác nhận.

## Khung thời lượng chuẩn cho số điểm tin 10 tin / 2 phút

| Mốc | Phần | Thời lượng | Số âm tiết |
|---|---|---|---|
| 0:00 – 0:05 | Hook | 5s | ~22 |
| 0:05 – 0:18 | Tin 1 (tin mạnh nhất, kể kỹ nhất) | 13s | ~55 |
| 0:18 – 1:45 | Tin 2 → 10 | ~9,5s mỗi tin | ~40 mỗi tin |
| 1:45 – 1:57 | Chốt + kêu gọi | 6s | ~27 |

Quy tắc xếp tin: **mạnh nhất lên đầu, tin dễ gây tranh luận để cuối** để câu kêu gọi bình
luận có chỗ bám. Đây cũng chính là thứ tự pipeline tự tạo, vì tin được xếp theo điểm số
giảm dần.

**Nhịp cảnh.** Cảnh ngắn hơn 6 giây thì người xem chưa kịp đọc chữ trên màn hình đã bị
cắt. Pipeline tự giữ những cảnh như vậy lâu thêm bằng khoảng lặng (`video.min_scene_sec`),
nên tin chỉ có mỗi tiêu đề vẫn không bị lướt qua quá nhanh. Viết tay thì nhớ nguyên tắc
này: **không cảnh nào dưới 6 giây**, và cảnh dài nhất đừng quá gấp đôi cảnh ngắn nhất.

---

## Mẫu 1 — Điểm tin hằng ngày (bản pipeline tự sinh, giọng văn miền Tây)

Trích kịch bản thật do `make video` sinh ra ngày 21/09/2026 với `script.style = "mien_tay"`.
Phần in nghiêng là câu cảm thán do pipeline chèn theo nhóm nội dung của từng tin.

> **[Hook]** Ngày 21 tháng 9, làng giải trí có mười chuyện, ngồi xuống nghe chơi nghen.
>
> **[Tin 1]** Đạo diễn *Bóng ma nhà hát* xin lỗi khán giả ngay khi phim ra mắt. Ngay sau
> suất chiếu đầu tiên, đạo diễn gửi lời xin lỗi, thừa nhận phim đầu tay còn nhiều sai sót.
> — *không có câu cảm thán, vì tin có chữ "xin lỗi"*
>
> **[Tin 3]** Một cặp đôi ca sĩ Vbiz thông báo đã đăng ký kết hôn vào ngày đặc biệt,
> trước thềm diễn ra lễ cưới. *Vậy là sắp có đám ăn rồi hen.*
>
> **[Tin 6]** Vân Dung gây tranh cãi với vai người mẹ khắc nghiệt trong phim giờ vàng.
> Nhân vật khiến khán giả bức xúc vì can thiệp sâu vào chuyện tình cảm của con gái.
> *Vụ này chắc còn dài dài nghen.*
>
> **[Tin 9]** Rapper Pháo lại thi hoa hậu. *Chờ coi ai đăng quang nghen bà con.*
>
> **[Chốt]** Tin nào làm bà con hết hồn nhất? Để lại còm men nghen. Theo dõi đặng mai
> coi tiếp cho vui.

**Nhận xét để cải thiện:** tin 9 chỉ có mỗi tiêu đề, nghe mỏng. Khi duyệt kịch bản buổi
sáng, đây là chỗ nên sửa tay: mở link trong `sources.txt`, lấy thêm một chi tiết cụ thể
(con số, câu nói, phản ứng của khán giả) rồi chạy `make rerender`.

**Về phần hài:** câu cảm thán do pipeline chèn là loại an toàn — phản ứng cảm xúc chung
chung, không khẳng định thêm điều gì về nhân vật. Muốn đùa sắc hơn thì phải viết tay, và
phải tự chịu trách nhiệm: một câu đùa nhắm vào cá nhân đủ sức thổi bay cả kênh.

---

## Mẫu 2 — Tin nóng lẻ (25–35 giây)

Dùng khi có một tin đủ lớn để đứng riêng. Đây là định dạng dễ lên xu hướng nhất, vì đăng
được trong vòng 1–2 giờ sau khi tin nổ.

> **[0:00]** [Tên] vừa lên tiếng, và đây là điều nhiều người chờ suốt mấy ngày qua.
>
> **[0:04]** Chuyện bắt đầu từ [mốc thời gian], khi [sự việc gốc, một câu].
>
> **[0:11]** Đến [hôm nay / chiều nay], [chủ thể] chính thức phản hồi trên [nền tảng]:
> [trích dẫn ngắn, giữ nguyên văn, không diễn giải].
>
> **[0:20]** Phía [bên liên quan] hiện chưa đưa ra bình luận. Theo [nguồn], [chi tiết bổ sung].
>
> **[0:28]** Bạn nghĩ chuyện này sẽ đi tới đâu? Comment bên dưới, mình cập nhật tiếp khi có tin mới.

**Lưu ý nghề:** câu "phía [bên liên quan] hiện chưa bình luận" là câu quan trọng nhất về
mặt an toàn. Nó nói rõ với người xem rằng đây mới là một chiều thông tin.

---

## Mẫu 3 — Giải thích drama (60–90 giây)

Dùng khi một vụ việc đã kéo dài vài ngày và người xem vào sau không hiểu đầu đuôi.
Định dạng này có tỷ lệ xem hết cao nhất vì người xem cần câu trả lời ở cuối.

> **[0:00]** Nếu bạn thấy cái tên này ở khắp nơi mà không hiểu chuyện gì, video này giải
> thích trong một phút.
>
> **[0:06] Bối cảnh.** [Ai, làm nghề gì, nổi lên từ đâu — đúng một câu].
>
> **[0:14] Ngòi nổ.** Ngày [X], [sự việc châm ngòi].
>
> **[0:26] Leo thang.** Sau đó [phản ứng của bên A], rồi [phản ứng của bên B].
>
> **[0:42] Hiện tại.** Tính đến [hôm nay], [tình trạng mới nhất theo nguồn].
>
> **[0:52] Điều chưa rõ.** Vẫn còn [câu hỏi chưa có lời đáp] — đây là chỗ mọi người đang tranh cãi.
>
> **[1:02]** Bạn đứng về phía nào? Nói mình nghe ở phần bình luận.

**Nhịp hình:** mỗi phần một khung hình khác nhau, có mốc ngày tháng hiện lên góc trên.
Người xem cần thấy *dòng thời gian*, không chỉ nghe.

---

## Mẫu 4 — Bảng xếp hạng (45–60 giây)

Đếm ngược tạo lực kéo tự nhiên đến cuối video.

> **[0:00]** 5 [nghệ sĩ / MV / phim] được nhắc tới nhiều nhất tuần này. Vị trí số 1 gây bất ngờ.
>
> **[0:06]** Số 5, [tên] — [lý do, một câu].
> **[0:15]** Số 4, [tên] — [lý do].
> **[0:24]** Số 3, [tên] — [lý do].
> **[0:33]** Số 2, [tên] — [lý do].
> **[0:42]** Và số 1, [tên] — [lý do, câu này dài hơn một chút cho có sức nặng].
>
> **[0:52]** Bạn thấy thứ tự này hợp lý chưa? Ai xứng đáng đứng đầu hơn?

**Mẹo:** nói trước ở hook rằng vị trí số 1 gây bất ngờ, nhưng đừng tiết lộ. Đó là lý do
người xem ở lại hết 60 giây.

---

## Mẫu 5 — Nhìn lại (45–60 giây)

Nội dung không hết hạn, đăng vào ngày ít tin. Neo vào một mốc kỷ niệm có thật.

> **[0:00]** Đúng [N] năm trước, [sự kiện] đã thay đổi cả làng nhạc Việt.
>
> **[0:07]** Khi đó, [bối cảnh thời điểm ấy].
>
> **[0:18]** Điều ít ai nhớ là [chi tiết ít người biết, đã kiểm chứng].
>
> **[0:32]** Đến hôm nay, [những người trong cuộc giờ ra sao].
>
> **[0:46]** Bạn còn nhớ mình đang làm gì thời điểm đó không?

---

## Cách sửa tay kịch bản do máy sinh

1. `make script` — dựng kịch bản, chưa render (nhanh, không tốn thời gian chờ).
2. Mở `output/<ngày>/script.json`, sửa trường `vo` của từng cảnh. Đây là lời đọc.
   Trường `headline` là chữ hiện trên màn hình, sửa riêng được.
3. Giữ tổng số âm tiết trong khoảng **370–500** (chạy `make calibrate` để lấy con số
   đúng với cấu hình của bạn). Đếm nhanh: mỗi chữ cách nhau bằng khoảng trắng là 1 âm tiết.
4. `make rerender` — render từ kịch bản đã sửa.

Ba chỗ đáng sửa tay nhất, theo thứ tự hiệu quả:

- **Câu hook** — máy chọn ngẫu nhiên từ danh sách, người viết luôn làm tốt hơn khi đã
  biết tin số 1 là gì.
- **Tin mỏng** — tin nào chỉ có mỗi tiêu đề thì mở link nguồn lấy thêm một chi tiết đắt.
- **Tên riêng khó đọc** — tên nước ngoài hoặc viết tắt lạ thì viết lại theo cách đọc
  trong trường `vo`, giữ nguyên chính tả ở `headline`.
