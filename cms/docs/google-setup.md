# Bật đăng nhập Google

Mặc định CMS đăng nhập bằng email và mật khẩu. Bật thêm Google nếu bạn muốn khỏi phải nhớ
mật khẩu riêng, hoặc muốn nhiều người trong công ty cùng dùng.

## Các bước

1. Vào <https://console.cloud.google.com/apis/credentials>, chọn (hoặc tạo) một project.
2. **Create Credentials** → **OAuth client ID** → loại **Web application**.
3. Ở **Authorized redirect URIs**, thêm đúng chuỗi mà CMS hiển thị ở mục *Cài đặt*:
   ```
   http://localhost:8000/auth/google/callback
   ```
4. Chép **Client ID** và **Client secret** vào CMS → **Cài đặt** → *Đăng nhập Google*.
5. Lưu, rồi đăng xuất. Trang đăng nhập sẽ có thêm nút **Đăng nhập bằng Google**.

## Ai được vào — điều quan trọng nhất

Ô **Tên miền được phép** quyết định điều này:

- **Bỏ trống** (mặc định): chỉ email **đã có sẵn trong bảng users** mới vào được.
  An toàn nhất. Muốn thêm người thì tạo tài khoản trước bằng `php artisan tinker`.
- **Điền tên miền** (vd `metacrew.vn`): bất kỳ ai có email `@metacrew.vn` đăng nhập lần
  đầu sẽ **tự được tạo tài khoản**. Tiện cho nhóm, nhưng chỉ dùng khi bạn kiểm soát được
  việc cấp email của tên miền đó.

Không có hai điều kiện trên thì CMS từ chối và ghi vào nhật ký. Nếu không chặn, bất kỳ ai
có Gmail cũng vào được CMS đang giữ token TikTok của bạn.

## Thêm người dùng bằng tay

```bash
php artisan tinker --execute='
App\Models\User::create([
  "name" => "Tên người dùng",
  "email" => "nguoi@congty.vn",
  "password" => bcrypt("mật-khẩu-tạm"),
]);'
```

Sau đó người này đăng nhập được bằng Google (nếu email trùng) hoặc bằng mật khẩu tạm.

## Xác thực hai lớp vẫn có hiệu lực

Bật 2FA rồi thì **kể cả đăng nhập bằng Google cũng phải nhập mã OTP**. Google xác minh
danh tính, 2FA xác minh thiết bị — hai lớp khác nhau, cố ý không thay thế nhau.
