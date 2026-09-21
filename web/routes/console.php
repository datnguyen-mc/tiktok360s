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
