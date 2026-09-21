<?php

use Illuminate\Support\Facades\Schedule;

// Hàng đợi đăng bài: mỗi phút một lượt, đủ nhanh cho job hẹn giờ theo phút.
Schedule::command('publish:process')->everyMinute()->withoutOverlapping();
