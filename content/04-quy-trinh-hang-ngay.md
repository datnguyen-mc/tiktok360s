# Quy trình vận hành hằng ngày

Tổng thời gian người thật bỏ ra: **10–12 phút/ngày**. Máy làm phần nặng, người làm
phần phán đoán — chọn tin, kiểm chứng, và quyết định có đăng hay không.

## 7:30 — Máy chạy (0 phút)

Lịch tự động chạy `automation/run-daily.sh`. Xong sẽ có thông báo trên màn hình.
Kết quả nằm ở `output/<ngày>/`.

Chưa cài lịch thì chạy tay: `make video`.

## 7:35 — Duyệt kịch bản (4 phút)

Mở `output/<ngày>/script.json` và soát 4 điểm, theo đúng thứ tự:

1. **Có tin nào không nên đăng không?** Tin tang thương, bệnh tật, đời tư nhạy cảm,
   tin về trẻ vị thành niên. Pipeline đã lọc theo `block_keywords` nhưng bộ lọc từ khoá
   không bắt được mọi trường hợp. Đây là bước người phải làm.
2. **Tin số 1 có đủ mạnh không?** Nếu tin đầu nhạt thì đổi thứ tự — người xem quyết định
   ở lại hay không trong 8 giây đầu.
3. **Câu cảm thán có hợp với tin không?** Pipeline chọn theo từ khoá nên đa số hợp, nhưng
   tin lạ có thể rơi vào nhóm sai. Câu nào nghe lệch thì xoá khỏi trường `vo`.
4. **Có tin nào chỉ có mỗi tiêu đề không?** Mở link trong `sources.txt`, lấy thêm
   một chi tiết cụ thể rồi bổ sung vào trường `vo`.
5. **Tên riêng có đọc đúng không?** Tên nước ngoài, từ viết tắt lạ — sửa lại theo cách
   đọc trong trường `vo`, giữ nguyên chính tả ở `headline`.

Có sửa thì chạy `make rerender`.

## 7:45 — Xem lại video (3 phút)

Xem hết một lượt, **để điện thoại cách mắt một sải tay** như người xem thật:

- Chữ có đọc kịp không? Phụ đề có khớp tiếng không?
- Ảnh có bị mờ vỡ không? (ảnh nguồn nhỏ sẽ lộ ra khi phóng to)
- Thời lượng có nằm trong 90–120 giây không?
- Tắt tiếng xem lại 10 giây đầu — vẫn hiểu đang nói gì chứ?

## 11:30 — Đăng (3 phút)

1. Chuyển `output/<ngày>/*.mp4` sang điện thoại (AirDrop nhanh nhất).
2. Dán nội dung `caption.txt`.
3. **Thêm 1–3 hashtag cụ thể** cho các tin trong video (tên nghệ sĩ, tên phim).
4. Thêm nhạc xu hướng trong ứng dụng, để âm lượng 10–15%.
5. Chọn ảnh bìa — dùng `thumbnail.jpg` hoặc chọn khung có mặt người rõ nhất.
6. Đăng, hoặc hẹn giờ.

## 12:00 — Trả lời bình luận (2 phút)

30 phút đầu sau khi đăng là lúc thuật toán quyết định có đẩy video đi xa hay không.
Trả lời càng nhiều bình luận càng tốt trong khung này. Một câu trả lời hay còn có thể
trở thành ý tưởng cho video hôm sau.

---

## Nguyên tắc về nguồn tin và bản quyền

Đây là phần quyết định kênh tồn tại được bao lâu. Đọc kỹ một lần rồi làm theo.

**Với thông tin:**
- Luôn dẫn nguồn trên màn hình (pipeline đã tự gắn badge "Nguồn: ...").
- Tin chưa được người trong cuộc xác nhận thì phải nói "theo [nguồn]", không nói như
  sự thật đã rồi.
- Không suy diễn về đời tư, sức khoẻ, quan hệ tình cảm dựa trên ảnh hoặc tin đồn.
- Sai thì sửa công khai ở video sau. Đây là thứ giữ được niềm tin lâu dài.

**Với hình ảnh:**
- Pipeline lấy ảnh thumbnail từ RSS của báo. Ảnh đó thuộc bản quyền của báo hoặc
  nhiếp ảnh gia. Dùng kèm ghi nguồn trong ngữ cảnh đưa tin là thông lệ phổ biến,
  nhưng **không phải là giấy phép**.
- An toàn hơn: dùng ảnh nghệ sĩ tự đăng công khai (có ghi nguồn), ảnh từ thông cáo
  báo chí, hoặc ảnh có giấy phép thương mại.
- Bị chủ sở hữu yêu cầu gỡ thì gỡ ngay, đừng tranh cãi. Một video không đáng để mất kênh.
- Muốn thay toàn bộ bằng kho ảnh riêng: bỏ ảnh vào `assets/broll/` và sửa hàm
  `download` trong [pipeline/visuals.py](../pipeline/visuals.py) để đọc từ thư mục đó.

**Với TikTok:**
- Không đăng lại nguyên video của kênh khác.
- Không dùng tiêu đề sai lệch so với nội dung — đây là lý do bị giảm phân phối
  phổ biến nhất với kênh tin tức.

---

## Khi có sự cố

| Hiện tượng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Không lấy được tin | báo đổi địa chỉ RSS | `make news` xem nguồn nào báo lỗi, sửa trong `config.json` |
| Video dài quá khung | kịch bản sửa tay quá dài | chạy `make calibrate` xem ngân sách âm tiết, rồi cắt cho vừa |
| Giọng đọc nhanh/chậm bất thường | khâu canh thời lượng phải chỉnh tốc độ nhiều | kịch bản lệch ngân sách — sửa độ dài kịch bản, đừng sửa `voice.rate` |
| Câu đùa lệch nội dung tin | tin không khớp nhóm từ khoá nào | thêm từ khoá vào `NHOM_TU_KHOA` trong `pipeline/styles.py` |
| Không lấy được tin cho ngày cũ | RSS không giữ tin quá vài ngày | chỉ lùi được 1–2 ngày; xa hơn phải lấy tay |
| Giọng đọc nghe vấp | tên riêng hoặc từ viết tắt lạ | viết lại theo cách đọc trong trường `vo` |
| Ảnh mờ, vỡ hạt | ảnh nguồn độ phân giải thấp | thêm quy tắc vào `upgrade_url` trong `visuals.py`, hoặc thay ảnh tay |
| Render báo lỗi ffmpeg | thiếu ffmpeg hoặc bản thiếu bộ mã hoá | chạy lại `make setup` |
| Tin trùng nhau | ngưỡng lọc trùng chưa phù hợp | hạ `threshold` trong hàm `dedupe` của `fetch_news.py` |

Log đầy đủ nằm ở `logs/<ngày>.log`.
