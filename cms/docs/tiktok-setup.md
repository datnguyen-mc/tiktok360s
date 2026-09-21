# Lấy khoá TikTok Content Posting API

Đây là phần tốn thời gian nhất của cả hệ thống, và phần lớn thời gian là **chờ TikTok
duyệt**, không phải làm kỹ thuật. Đọc hết mục "Hai chế độ đăng" trước khi bắt đầu — chọn
đúng chế độ có thể tiết kiệm cho bạn vài tuần chờ đợi.

## Hai chế độ đăng — chọn trước khi làm gì cả

| | **Vào mục nháp** (`inbox`) | **Đăng thẳng** (`direct_post`) |
|---|---|---|
| Quyền cần xin | `video.upload` | `video.publish` |
| Mức độ khó được duyệt | dễ | khó, phải nộp app cho TikTok xét |
| Kết quả | video vào mục nháp trong app, bạn bấm đăng | video lên thẳng kênh |
| Trước khi app được duyệt | **chạy bình thường** | chỉ đăng được ở mức *Chỉ mình tôi* |
| Thao tác tay mỗi ngày | ~30 giây trên điện thoại | không |

**Khuyến nghị: bắt đầu bằng `inbox`.** Nó chạy được ngay, và 30 giây bấm đăng mỗi ngày
đổi lại việc không phải chờ TikTok duyệt. Khi kênh đã ổn định thì nộp app xin
`video.publish` và chuyển sang `direct_post`.

## Các bước

### 1. Tạo ứng dụng

1. Vào <https://developers.tiktok.com> → đăng nhập → **Manage apps** → **Connect an app**.
2. Điền tên app, mô tả, và đường dẫn tới chính sách bảo mật của bạn.
   TikTok bắt buộc có link chính sách bảo mật kể cả khi app chỉ dùng nội bộ.

### 2. Bật sản phẩm

Trong app vừa tạo, phần **Products**, thêm:

- **Login Kit** — để lấy được quyền truy cập tài khoản
- **Content Posting API** — để đăng video

Ở Content Posting API, chọn:

- `inbox` → bật **Direct Post: OFF**
- `direct_post` → bật **Direct Post: ON** (mục này cần nộp app cho TikTok duyệt)

### 3. Khai quyền và đường dẫn quay về

**Scopes** cần bật:

```
user.info.basic      ← bắt buộc, để biết đang đăng vào tài khoản nào
video.upload         ← chế độ vào mục nháp
video.publish        ← chỉ khi dùng chế độ đăng thẳng
```

**Redirect URI** — chép đúng chuỗi mà CMS hiển thị ở mục *Cài đặt*:

```
http://localhost:8000/tiktok/callback
```

Sai một ký tự là TikTok từ chối, kể cả dấu `/` ở cuối. Khi đưa lên máy chủ thật thì đổi
thành tên miền thật và **phải là HTTPS** — TikTok không nhận HTTP cho tên miền công khai
(riêng `localhost` thì được).

### 4. Chép khoá vào CMS

Mở CMS → **Cài đặt** → mục *Khoá TikTok Open API*:

| Ô | Lấy ở đâu |
|---|---|
| Client Key | trang app TikTok, mục *Credentials* |
| Client Secret | ngay bên dưới, bấm *Show* |
| Redirect URI | chuỗi ở bước 3 |
| Cách đăng mặc định | `inbox` hoặc `direct_post` |

Bấm **Lưu cấu hình**. Khoá được mã hoá trước khi lưu xuống MySQL.

> Khai trong `.env` cũng được (`TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`,
> `TIKTOK_REDIRECT_URI`). Giá trị trong CMS ưu tiên hơn; `.env` là dự phòng cho máy mới dựng.

### 5. Kết nối kênh

CMS → **Kênh TikTok** → **Kết nối kênh mới**. Bạn sẽ được chuyển sang TikTok để cấp quyền,
rồi quay lại CMS. Kênh xuất hiện trong danh sách kèm hạn token.

Token truy cập sống 24 giờ và **CMS tự làm mới** bằng refresh token (sống 365 ngày).
Bạn chỉ phải kết nối lại khi refresh token hết hạn hoặc bạn đổi mật khẩu TikTok.

## Giới hạn cần biết

- **Chưa được duyệt thì chỉ đăng riêng tư.** Ứng dụng ở trạng thái *unaudited* chỉ đăng
  được với `privacy_level = SELF_ONLY`. Video vẫn lên tài khoản, nhưng chỉ bạn thấy.
  Đây là quy định của TikTok, không phải lỗi cấu hình.
- **Hạn mức đăng.** TikTok giới hạn số video đăng qua API mỗi 24 giờ cho mỗi tài khoản
  (thường là 15 với app chưa duyệt). Một video mỗi ngày thì không bao giờ chạm trần.
- **Kích thước video.** CMS gửi trọn file trong một khối; TikTok cho tối đa 64 MB mỗi khối.
  Video của dây chuyền này khoảng 15–20 MB nên không vướng.
- **Caption tối đa 2200 ký tự**, CMS tự cắt nếu dài hơn.

## Khi gặp lỗi

| Thông báo | Nguyên nhân thường gặp |
|---|---|
| `redirect_uri mismatch` | Redirect URI trong app TikTok khác chuỗi trong CMS, thường lệch dấu `/` cuối |
| `scope_not_authorized` | Chưa bật scope trong app, hoặc đang dùng `direct_post` mà chưa được duyệt |
| `access_token_invalid` | Token hết hạn và refresh cũng hết — kết nối lại kênh |
| `spam_risk_too_many_posts` | Chạm hạn mức 24 giờ, chờ qua ngày |
| `privacy_level_option_mismatch` | Chọn mức riêng tư mà tài khoản không cho phép; CMS tự lùi về `SELF_ONLY` |

Toàn bộ lỗi được ghi ở CMS → **Nhật ký**, kèm mã lỗi và `log_id` của TikTok để đối chiếu
khi cần liên hệ hỗ trợ.
