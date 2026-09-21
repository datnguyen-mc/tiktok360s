# Showbiz CMS

Bảng điều khiển cho dây chuyền video: theo dõi mọi lần chạy, xem lại video, và đăng lên
TikTok. Laravel 12 + Vue 3 SPA + MySQL.

```bash
make cms-up          # bật MySQL + server (chạy từ thư mục gốc project)
```

Mở <http://localhost:8000> · `admin@showbiz.local` / `showbiz2026`

## Nó giải quyết việc gì

Dây chuyền Python tạo ra một thư mục `output/<ngày>/` mỗi ngày. Sau vài tuần thì không ai
nhớ nổi video nào đã đăng, tin nào đã dùng, hay vì sao hôm đó video dài 118 giây.
CMS lưu lại toàn bộ vào MySQL và cho tra lại: từng tin, từng nguồn, sai số thời lượng,
lịch sử đăng bài, và nhật ký lỗi.

## Kiến trúc

```
Dây chuyền Python ──POST /api/ingest/run──► Laravel ──► MySQL
       ▲                (khoá tĩnh)            │
       │                                       ▼
       └──── Engine "local" kích hoạt ◄──── Vue 3 SPA
                                               │
                                               ▼
                                     TikTok Content Posting API
```

Ba điểm đáng nói:

**Nạp dữ liệu tách khỏi phiên đăng nhập.** Script nền không có trình duyệt, nên
`POST /api/ingest/run` xác thực bằng khoá tĩnh `X-Ingest-Token`. Mọi endpoint còn lại dùng
phiên đăng nhập thường.

**CMS hỏng thì video vẫn ra.** `pipeline/cms.py` bắt mọi lỗi mạng và chỉ in cảnh báo.
Dữ liệu nằm nguyên trong `output/`, nạp lại lúc nào cũng được bằng `make cms-push`.

**Token được mã hoá trong DB.** Access token và refresh token của TikTok, API key của
engine, client secret — tất cả mã hoá bằng `APP_KEY` ở tầng model. Đổi `APP_KEY` là mất
hết token, phải kết nối lại kênh.

## Các trang

| Trang | Việc |
|---|---|
| **Tổng quan** | Số liệu 30 ngày, biểu đồ thời lượng thực tế so với ước lượng, tỉ lệ tin theo nguồn |
| **Video** | Bảng lọc theo chủ đề/ngày/trạng thái; nút **Tạo video** cho nhập prompt và lưu lại |
| **Chủ đề kênh** | Nguồn tin, từ khoá, nhận diện, giọng văn của từng chủ đề — sửa thẳng file `topics/*.json` |
| **Chi tiết video** | Xem video, bấm vào tin để tua tới đúng cảnh, caption, lịch sử đăng |
| **Đăng bài** | Hàng đợi TikTok: thử lại, kiểm tra trạng thái, mở link bài đã đăng |
| **Kênh TikTok** | Kết nối tài khoản, thiết lập tự đăng theo giờ cho từng kênh |
| **Engine tạo video** | Dây chuyền nội bộ, **Google Veo 3**, **Kling AI**, hoặc model riêng — kèm ước tính chi phí |
| **Cài đặt** | Khoá TikTok và Google, sửa ngay trên web |
| **Tài khoản của tôi** | Sửa tên/email/ảnh, đổi mật khẩu, bật xác thực hai lớp |

## Đăng nhập

Ba lớp, bật được độc lập:

1. **Email + mật khẩu** — mặc định, luôn có.
2. **Google** — xem [docs/google-setup.md](docs/google-setup.md).
   Ai được vào do ô *Tên miền được phép* quyết định; bỏ trống thì chỉ email đã có sẵn.
3. **Xác thực hai lớp (TOTP)** — mã 6 số từ Google Authenticator/Authy, kèm 8 mã dự phòng
   dùng một lần. Bật ở mục *Tài khoản của tôi*.

Bật 2FA rồi thì đăng nhập bằng Google **vẫn phải** nhập mã OTP — Google xác minh danh tính,
2FA xác minh thiết bị.

> Luồng bật 2FA có hai bước có chủ đích: tạo mã QR trước, chỉ thật sự bật sau khi bạn nhập
> đúng một mã. Nếu bật ngay lúc tạo, người quét hỏng QR sẽ tự khoá mình khỏi tài khoản.

## Đăng lên TikTok

Xem [docs/tiktok-setup.md](docs/tiktok-setup.md) để lấy khoá. Tóm tắt phần quyết định:

| | Vào mục nháp (`inbox`) | Đăng thẳng (`direct_post`) |
|---|---|---|
| Quyền | `video.upload` | `video.publish` |
| Được duyệt | dễ | phải nộp app cho TikTok |
| Chưa duyệt | chạy bình thường | chỉ đăng được mức *Chỉ mình tôi* |

**Bắt đầu bằng `inbox`.** Nó chạy được ngay hôm nay.

**Tự động đăng:** mỗi kênh bật được *Tự động đăng* kèm giờ mong muốn. Dây chuyền nạp video
mới xong là CMS tự xếp job cho các kênh đó; lệnh `publish:process` chạy mỗi phút sẽ đăng
khi tới giờ. Cần scheduler chạy nền:

```bash
php artisan schedule:work          # phát triển
* * * * * cd /đường/dẫn/cms && php artisan schedule:run >> /dev/null 2>&1   # máy chủ
```

## Engine tạo video

Bốn loại:

- **local** — chạy dây chuyền Python trên chính máy này, dùng ảnh từ bài báo. Miễn phí.
  CMS chỉ khởi động tiến trình nền rồi trả lời ngay, vì render mất khoảng một phút.
- **Google Veo 3** / **Kling AI** — sinh cảnh bằng AI theo prompt riêng của từng kênh.
- **http** — gọi sang model dựng video riêng của bạn. CMS gửi:

  ```json
  {
    "date": "2026-09-21",
    "items": 10,
    "voice": "vi-VN-HoaiMyNeural",
    "callback_url": "http://localhost:8000/api/ingest/run",
    "callback_token": "…"
  }
  ```

  Dịch vụ của bạn render xong thì `POST` kết quả về `callback_url` kèm header
  `X-Ingest-Token: <callback_token>`. Cấu trúc gói dữ liệu xem trong
  [`app/Http/Controllers/Api/IngestController.php`](app/Http/Controllers/Api/IngestController.php)
  hoặc mẫu thật ở [`../pipeline/cms.py`](../pipeline/cms.py).

## Sinh cảnh bằng AI (Veo 3 / Kling)

Có hai chỗ đặt prompt, dùng cho hai việc khác nhau:

- **Prompt của kênh** (mục *Kênh TikTok* → tab *Prompt tạo cảnh*) — gắn cố định vào một
  kênh, dùng cho lịch chạy tự động hằng ngày.
- **Prompt rời** (mục *Video* → nút **Tạo video**) — gõ ngay lúc tạo, xem thử được với
  một tin mẫu, và tick **“Lưu prompt này để dùng lại”** thì nó vào thư viện, lần sau chọn
  lại từ danh sách. Không tick thì chạy xong là xong, không để lại rác.

Cả hai đều dùng chung bộ biến `{tieu_de}`, `{tom_tat}`, `{nguon}`, `{chu_de}`,
`{so_thu_tu}`, `{tong_so}`, `{ngay}`. Mỗi tin sinh một clip, rồi ghép theo đúng mốc lời
đọc; clip ngắn hơn cảnh thì được lặp cho đủ.

**Khoá API hỏng thì video vẫn ra.** Clip nào sinh lỗi thì cảnh đó lùi về dùng ảnh từ bài
báo, chi phí ghi nhận 0, và dây chuyền chạy tiếp — không có chuyện mất trắng một ngày vì
token hết hạn.

**Điều quan trọng nhất cần biết trước khi bật:** cả Veo lẫn Kling **chỉ tạo được clip
ngắn** — Veo 4–8 giây, Kling 5 hoặc 10 giây. Không model nào tạo thẳng video 2 phút.
Video dài là nhiều clip ghép lại, và **tiền tính theo tổng số giây**:

| Model | USD/giây | Mỗi video 105s | Mỗi tháng | Mỗi năm |
|---|---:|---:|---:|---:|
| Veo 3.1 Standard 1080p | 0,40 | 44,80 | 1.344 | 16.128 |
| Veo 3.1 Fast 720p | 0,10 | 11,20 | 336 | 4.032 |
| Veo 3.1 Lite 720p | 0,05 | 5,60 | 168 | 2.016 |
| Kling 1.0 (std) | ~0,03 | 3,30 | 99 | 1.188 |

Giao diện Engine có bộ ước tính hiện ba con số này ngay khi bạn chọn model, và chuyển
sang màu đỏ khi vượt 300 USD/tháng. Giá là bảng công bố tháng 9/2026 — nhà cung cấp đổi
lúc nào cũng được, nên có ô điền đơn giá tay để ước tính khỏi lệch.

Chưa cấu hình engine AI thì dây chuyền dùng ảnh báo như bình thường, không tốn gì.

## Cơ sở dữ liệu

MySQL 8 chạy trong container riêng ở cổng **3316**, để không đụng MySQL hay MAMP sẵn có.

| Bảng | Giữ gì |
|---|---|
| `runs` | mỗi lần chạy: chủ đề, thời lượng, ước lượng, giọng, đường dẫn video. Khoá định danh là **(chủ đề, ngày)** — hai chủ đề chạy cùng ngày là hai video khác nhau |
| `run_items` | từng tin: tiêu đề, nguồn, điểm hot, nhóm nội dung, mốc cảnh, prompt và chi phí clip |
| `tiktok_accounts` | kênh đã kết nối + thiết lập đăng bài, token mã hoá |
| `publish_jobs` | mỗi lần đăng: trạng thái, publish_id, lỗi, phản hồi thô của TikTok |
| `video_engines` | nơi video được tạo ra (local / Veo / Kling / API riêng), khoá mã hoá |
| `settings` | khoá API sửa được trên web |
| `activity_logs` | nhật ký sự kiện |

## Lệnh hay dùng

```bash
php artisan migrate                 # cập nhật schema
php artisan db:seed                 # tạo lại tài khoản quản trị
php artisan publish:process         # xử lý hàng đợi đăng bài ngay
php artisan schedule:work           # chạy scheduler khi phát triển
npm run dev                         # frontend có hot-reload (cổng 5174)
npm run build                       # build bản chạy thật
```

## Trước khi đưa lên máy chủ

CMS này mặc định dựng cho máy cá nhân. Đưa ra ngoài thì làm đủ các việc sau:

- Đổi mật khẩu tài khoản quản trị, và **bật xác thực hai lớp**.
- Đặt `APP_ENV=production`, `APP_DEBUG=false`.
- Chạy sau HTTPS — TikTok không nhận redirect URI dạng HTTP cho tên miền công khai.
- Đổi mật khẩu MySQL trong `docker-compose.yml` và `.env`.
- Sinh `INGEST_TOKEN` mới (`openssl rand -hex 24`) và cập nhật cả hai nơi.
- Sao lưu `APP_KEY` — mất là mất toàn bộ token đã mã hoá.
