<?php

use Illuminate\Support\Facades\Schedule;

/*
 | Lấy tin mỗi 30 phút. Các báo đăng liên tục nên 30 phút là đủ tươi mà không
 | làm phiền máy chủ nguồn; RSS của họ cũng thường chỉ cập nhật theo khoảng đó.
 */
Schedule::command('news:fetch')->everyThirtyMinutes()->withoutOverlapping();

/*
 | Gom lượt truy cập thành số liệu theo ngày, 10 phút một lần.
 |
 | Mỗi lần chạy tính lại nguyên hai ngày gần nhất chứ không cộng dồn — cộng dồn
 | thì một lần chạy lỗi là số sai vĩnh viễn mà không cách nào phát hiện. Tính
 | lại cả ngày hôm qua vì lượt truy cập lúc gần nửa đêm có thể rơi sang sau lần
 | gom cuối cùng của ngày đó.
 */
Schedule::command('stats:rollup')->everyTenMinutes()->withoutOverlapping();

/*
 | Dọn nợ nội dung và ảnh mỗi 15 phút.
 |
 | Tách khỏi `news:fetch` vì hai việc khác nhau: lấy tin mới phải nhanh, còn bổ
 | sung nội dung cho bài cũ thì chậm và có thể chạy nhiều lượt. Hạn mức nhỏ để
 | không bắn quá nhiều request vào máy chủ của các báo.
 */
Schedule::command('news:backfill --limit=20')->everyFifteenMinutes()->withoutOverlapping();

/*
 | Gương ảnh bài viết lên R2, mỗi 15 phút.
 |
 | Chạy sau `news:backfill` vì chính lệnh đó mới điền `image_url` cho bài thiếu
 | ảnh — gương trước thì lượt nào cũng bỏ sót bài vừa có ảnh. Hạn mức nhỏ cùng lý
 | do: mỗi ảnh là một lượt tải từ CDN của toà soạn.
 */
Schedule::command('images:mirror --limit=20')->everyFifteenMinutes()->withoutOverlapping();
