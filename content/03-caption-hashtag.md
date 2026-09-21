# Caption, hashtag và phần chữ trên màn hình

## Cấu trúc caption

Pipeline tự sinh caption theo khuôn dưới đây (xem `build_caption` trong
[pipeline/script_builder.py](../pipeline/script_builder.py)):

```
📌 Tin showbiz 21/09/2026 — 10 tin nóng trong hai phút

1. [tiêu đề tin 1]
...
10. [tiêu đề tin 10]

Bạn quan tâm tin nào nhất? Comment bên dưới 👇
Theo dõi @kênh_của_bạn để cập nhật tin sao mỗi ngày.

#showbiz #showbizvietnam ...
```

Cụm "trong hai phút" tự đổi theo `video.target_*` trong config, không phải sửa tay.

Vì sao liệt kê đủ cả 10 tiêu đề: TikTok đọc chữ trong caption để hiểu video nói về gì. Nêu
đích danh tên nghệ sĩ và sự kiện giúp video đến đúng nhóm người đang tìm tin đó. Đây là
kênh phân phối thứ hai sau phần "Dành cho bạn", và nó hoàn toàn miễn phí.

**Chỉ 2 dòng đầu hiện ra trước khi người xem bấm "xem thêm".** Dòng đầu phải đủ hấp dẫn.

## Bộ hashtag

Dùng **6–10 thẻ**, chia ba tầng. Nhiều hơn 12 thẻ không giúp gì mà còn làm loãng chủ đề.

| Tầng | Vai trò | Ví dụ |
|---|---|---|
| **Rộng** (2–3 thẻ) | tiếp cận số đông | `#xuhuong` `#fyp` `#giaitri` |
| **Chủ đề** (3–4 thẻ) | báo cho thuật toán biết ngách | `#showbiz` `#showbizvietnam` `#tinsao` `#tingiaitri` |
| **Cụ thể** (1–3 thẻ) | bắt người đang tìm đúng tin đó | `#tênnghệsĩ` `#tênphim` `#tênsựkiện` |

Tầng "cụ thể" phải đổi theo từng video — đây là tầng mang lại lượt xem có chủ đích nhiều
nhất, và cũng là tầng duy nhất pipeline không tự sinh được. Thêm tay khi đăng.

Sửa bộ thẻ mặc định ở mục `hashtags` trong [config.json](../config.json).

## Chữ trên màn hình

Pipeline đang hiển thị 4 lớp chữ, mỗi lớp một nhiệm vụ:

| Lớp | Vị trí | Nhiệm vụ |
|---|---|---|
| Nhãn kênh + ngày | trên cùng | nhận diện, cho biết tin còn mới |
| `TIN 1/10` | góc thẻ ảnh | cho biết còn bao nhiêu tin nữa — lý do ở lại |
| Tiêu đề tin | dưới ảnh | đọc lướt không cần tiếng |
| Phụ đề karaoke | giữa dưới | bám theo lời đọc, chữ đang đọc tô vàng |

**Phụ đề karaoke là lớp quan trọng nhất.** Phần lớn người xem TikTok mở video ở chế độ
tắt tiếng trong vài giây đầu. Nếu không có chữ chạy, họ vuốt qua trước khi kịp bật tiếng.

**Vùng an toàn:** TikTok phủ giao diện lên mép phải (khoảng 120px, chỗ nút tim và chia sẻ)
và mép dưới (khoảng 220px, chỗ caption). Bố cục hiện tại đã chừa các vùng này —
khi sửa toạ độ trong [pipeline/visuals.py](../pipeline/visuals.py) thì giữ nguyên nguyên tắc:
chữ quan trọng nằm trong khoảng y từ 240 đến 1650.

## Tiêu đề video khi đăng

TikTok không có ô tiêu đề riêng — dòng đầu caption chính là tiêu đề. Ba kiểu chạy tốt:

- **Nêu con số:** "10 tin showbiz nóng nhất hôm nay 21/09"
- **Nêu tên đang hot:** "[Tên] lên tiếng, và 9 tin showbiz khác hôm nay"
- **Đặt câu hỏi:** "Chuyện gì đang xảy ra với [tên]? Tin showbiz 21/09"

Kiểu thứ hai thường cho lượt xem cao nhất vì bắt được người đang chủ động tìm tin về
người đó — nhưng chỉ dùng khi tin số 1 thật sự đủ lớn.

## Nhạc nền

Cách tốt nhất **không** phải ghép nhạc sẵn vào file video, mà là thêm nhạc xu hướng ngay
trong ứng dụng TikTok khi đăng, để âm lượng khoảng 10–15%. Video sẽ được gắn vào trang
của bản nhạc đó — thêm một kênh phân phối nữa.

Nếu vẫn muốn ghép nhạc nền vào file, đặt đường dẫn vào mục `music.file` trong
[config.json](../config.json). Pipeline sẽ tự hạ nhạc xuống khi có lời đọc
(kỹ thuật ducking). Chỉ dùng nhạc có giấy phép thương mại — TikTok Commercial Music
Library, YouTube Audio Library hoặc Pixabay Music.
