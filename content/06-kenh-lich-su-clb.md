# Kênh "Hồ sơ câu lạc bộ"

**Mỗi lần chạy dựng đúng một video cho một câu lạc bộ kế tiếp**: lịch sử thành
lập, sân nhà, danh hiệu và các dấu ấn tới năm 2026. Dài 90–120 giây, 12 cảnh.

```bash
.venv/bin/python -m pipeline.run_daily --topic clb            # 1 CLB kế tiếp
.venv/bin/python -m pipeline.run_daily --topic clb --count 3  # 3 CLB liền nhau
```

Lộ trình và trạng thái nằm ở bảng **`series_items`** trong cơ sở dữ liệu, không
phải trong file. Chạy lại bao nhiêu lần cũng đi tiếp chứ không lặp lại.

## Phạm vi — 7 giải lớn châu Âu

| Giải | Số CLB |
|---|---|
| Ngoại hạng Anh | 12 |
| La Liga | 9 |
| Serie A | 9 |
| Bundesliga | 9 |
| Ligue 1 | 7 |
| Eredivisie (Hà Lan) | 6 |
| Primeira Liga (Bồ Đào Nha) | 5 |

**57 câu lạc bộ** — ở mức 3–5 video mỗi ngày thì chạy được khoảng 11–19 ngày.
Hết danh sách thì thêm vào khoá `series.dan_bai`, hoặc sửa trong CMS.

## Lộ trình nằm trong cơ sở dữ liệu

Bảng `series_items`: mỗi dòng một câu lạc bộ, kèm dữ kiện và mốc "đã lên video".

| cột | nghĩa |
|---|---|
| `so` | thứ tự trong lộ trình |
| `ten`, `nhom` | tên CLB, giải đấu |
| `nam`, `san`, `danh_hieu` | năm thành lập, sân nhà, danh hiệu |
| `dau_an` | huyền thoại, trận để đời, mốc gần đây |
| `bat` | tắt thì bỏ qua, không cần xoá |
| `da_dung_luc`, `episode_id` | đã lên video lúc nào, ở tập nào |

Đánh dấu bằng **mốc thời gian** chứ không đếm theo số tập: tập bị xoá hay làm
lại thì phép đếm sai ngay, còn mốc thời gian thì luôn đúng.

`topics/clb.json` giờ chỉ là **bản gốc để nạp vào** và là phương án dự phòng khi
CMS không trả lời được:

```bash
cd cms && php artisan series:import clb          # nạp/cập nhật
cd cms && php artisan series:import clb --reset   # xoá cả trạng thái, làm lại từ đầu
```

Nạp lại **không** làm mất trạng thái đã lên video — sửa file rồi nạp lại chỉ cập
nhật dữ kiện, kênh vẫn đi tiếp chứ không quay đầu.

## Số liệu nằm trong lộ trình, không để AI tự nhớ

```json
{
  "so": 1, "ten": "Manchester United", "giai": "Ngoại hạng Anh",
  "nam": 1878, "san": "Old Trafford (74.000)",
  "danh_hieu": "20 vô địch Anh · 3 Champions League · 12 FA Cup · 1 Europa League",
  "dau_an": "Thảm hoạ Munich 1958 · kỷ nguyên Sir Alex 1986-2013 · cú ăn ba 1999 · sa sút sau 2013"
}
```

Đây là điểm khác quan trọng nhất so với kênh phim truyện. Số lần vô địch là **dữ
kiện về tổ chức có thật**; để model tự nhớ thì nó sẽ nhớ đúng với đội nổi tiếng
và nhớ sai với đội ít tên tuổi — mà sai một con số là mất uy tín cả kênh. Prompt
nói rõ: dùng đúng những số đã cho, không sửa, không thêm danh hiệu ngoài danh sách.

**Vẫn nên xem lại trước khi đăng.** Chế độ đăng là `inbox` (video vào hộp nháp
TikTok) nên đã có sẵn một bước duyệt.

## Hình ảnh

Kênh này không có ảnh báo để dùng như kênh điểm tin. Thay vì để trống một nền
chuyển màu, dây chuyền **vẽ thẳng dữ kiện lên khung hình**: tên giải, tên CLB,
năm thành lập, sân nhà, danh sách danh hiệu.

Bảng đứng yên suốt video thì người xem hết nhìn sau năm giây, nên **dòng đang
được nói tới sẽ sáng lên, phần còn lại mờ đi**. Chọn dòng nào thì căn theo NỘI
DUNG của cảnh (`vô địch`, `sân`, `thành lập`…) chứ không theo vị trí cảnh — chia
theo vị trí thì cảnh thứ ba luôn nhấn "sân nhà" kể cả khi nó đang kể về danh
hiệu, và người xem thấy ngay chữ với hình nói hai chuyện khác nhau.

Bật engine Veo/Kling trong CMS thì mỗi cảnh có clip AI riêng thay cho bảng — nhưng
Veo 3.1 tính 0,40 USD mỗi giây, một video 60 giây tốn khoảng 24 USD.

## Mỗi cảnh có ba phần

| | |
|---|---|
| `headline` | mô tả hình cho AI vẽ — **không hiện lên màn hình** |
| `nhan` | nhãn ngắn 3–6 chữ hiện trên màn hình ("Thành lập năm 1878") |
| `vo` | lời dẫn 14–24 chữ, giọng nam trầm |

Tách `nhan` khỏi `headline` vì hai thứ phục vụ hai việc khác nhau. Khi chưa bật
AI vẽ hình, đem `headline` ra hiển thị sẽ ra những dòng như *"Logo Manchester
United xuất hiện nổi bật trên nền đồ hoạ"* — đọc rất vô duyên.

## Nhiều video một ngày

Khoá `(chủ đề, ngày)` của bảng `runs` đã được mở rộng thành `(chủ đề, ngày, tập)`.
Không mở thì video thứ hai trong ngày **ghi đè lên video thứ nhất** và mất trắng.
Thư mục kết quả cũng tách: `output/clb/<ngày>/tap-07/`.

## Không bao giờ quay lại tập 1

`last_episode()` hỏi CMS **và** đọc đĩa, rồi lấy tập có số cao hơn. Nếu lần trước
CMS không nhận được (mạng hỏng, CMS đang khởi động lại) thì tập chỉ nằm trên đĩa,
CMS trả về `null`, và hôm sau series sẽ âm thầm quay về tập 1 — ghi đè lên tập cũ
mà không có lỗi nào hiện ra. Đối chiếu hai nguồn là để chặn đúng chuyện đó.
