<?php

use Illuminate\Support\Facades\Schedule;

// Hàng đợi đăng bài: mỗi phút một lượt, đủ nhanh cho job hẹn giờ theo phút.
Schedule::command('publish:process')->everyMinute()->withoutOverlapping();

/*
 | Dọn nhật ký hoạt động mỗi ngày lúc 03:30.
 |
 | Mỗi request ghi dữ liệu là một dòng nên bảng này lớn nhanh nhất hệ thống.
 | Dòng lỗi giữ 180 ngày, dòng thông tin chỉ 30 — lỗi là thứ người ta tìm lại
 | sau nhiều tháng, còn "ai bấm nút gì hôm thứ ba" thì không.
 */
Schedule::command('log:prune')->dailyAt('03:30')->withoutOverlapping();
