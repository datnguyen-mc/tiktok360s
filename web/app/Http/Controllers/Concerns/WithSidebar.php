<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Support\Facades\Cache;

/**
 * Dữ liệu cho cột bên phải.
 *
 * Đặt trong trait chứ không share toàn cục: trang quản trị và trang đăng nhập
 * không cần sidebar, mà share toàn cục thì mọi request đều phải chạy ba truy
 * vấn này. Cache 5 phút vì nội dung chỉ đổi khi có tin mới.
 */
trait WithSidebar
{
    protected function sidebar(?int $excludeId = null): array
    {
        return Cache::remember('sidebar.v1', now()->addMinutes(5), function () {
            return [
                // "Đọc nhiều" tính trong 7 ngày, không tính toàn thời gian —
                // nếu không thì một bài cũ viral sẽ đứng đó mãi mãi.
                'popular' => Article::published()
                    ->where('published_at', '>=', now()->subDays(7))
                    ->orderByDesc('views')->orderByDesc('published_at')
                    ->limit(6)
                    ->get(['id', 'title', 'slug', 'image_url', 'views', 'published_at'])
                    ->all(),

                'latest' => Article::published()
                    ->latest('published_at')->limit(6)
                    ->get(['id', 'title', 'slug', 'image_url', 'source', 'published_at'])
                    ->all(),

                'categories' => Category::active()
                    ->withCount(['articles' => fn ($q) => $q->where('status', 'published')])
                    ->get(['id', 'slug', 'name', 'color'])
                    ->all(),
            ];
        });
    }
}
