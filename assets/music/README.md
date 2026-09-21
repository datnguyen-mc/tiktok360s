# Nhạc nền

Thư mục này trống có chủ đích. Pipeline chạy tốt mà không cần nhạc nền.

**Cách được khuyến nghị:** thêm nhạc xu hướng ngay trong ứng dụng TikTok khi đăng,
để âm lượng 10–15%. Video sẽ được gắn vào trang của bản nhạc đó, có thêm một kênh
phân phối miễn phí.

**Nếu vẫn muốn ghép nhạc vào file video:**

1. Tải một bản nhạc **có giấy phép thương mại** vào thư mục này:
   - TikTok Commercial Music Library (miễn phí cho tài khoản doanh nghiệp)
   - YouTube Audio Library
   - Pixabay Music / Uppbeat (đọc kỹ điều kiện ghi nguồn)
2. Trỏ đường dẫn trong `config.json`:
   ```json
   "music": { "file": "assets/music/ten-file.mp3", "gain_db": -22, "duck_db": -10 }
   ```

Pipeline tự hạ nhạc xuống mỗi khi có lời đọc (ducking), nên giọng luôn nghe rõ.
`gain_db` càng âm thì nhạc càng nhỏ; `duck_db` là mức hạ thêm khi đang có tiếng nói.

**Đừng dùng nhạc lấy từ đĩa hoặc từ video khác** — kênh tin tức bị đánh bản quyền
âm thanh sẽ mất phân phối trên toàn bộ video cũ, không chỉ video vi phạm.
