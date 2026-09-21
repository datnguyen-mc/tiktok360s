<?php

namespace App\Providers;

use App\Models\SiteSetting;
use Illuminate\Support\ServiceProvider;
use Throwable;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    /**
     * Đổ cấu hình lưu trong cơ sở dữ liệu đè lên `config/site.php`.
     *
     * Làm ở đây thay vì sửa từng chỗ gọi `config('site.name')`: mọi nơi đang
     * đọc config — SEO, RSS, sitemap, trang chủ — tự nhiên dùng giá trị quản
     * trị viên vừa lưu, không phải đi sửa hàng chục lời gọi.
     *
     * Bọc try/catch vì provider chạy cả khi chưa migrate (lúc `artisan migrate`
     * lần đầu, hoặc trong CI với cơ sở dữ liệu trống) — ném lỗi ở đây là hỏng
     * luôn mọi lệnh artisan.
     */
    public function boot(): void
    {
        try {
            $s = SiteSetting::values();
        } catch (Throwable) {
            return;
        }

        config([
            'site.name'                 => $s['name'],
            'site.tagline'              => $s['tagline'],
            'site.logo'                 => $s['logo'],
            'site.per_page'             => (int) $s['per_page'],
            'site.google_analytics_id'  => $s['ga'] ?: null,
        ]);
    }
}
