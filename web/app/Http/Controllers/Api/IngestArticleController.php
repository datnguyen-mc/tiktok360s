<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * Nhận tin từ dây chuyền Python.
 *
 * Mỗi ngày dây chuyền lấy khoảng 350 tin cho hai chủ đề nhưng chỉ dùng 20 cho
 * video. Endpoint này giữ lại toàn bộ, nên website luôn có nội dung mới mà
 * không cần thêm một lần gọi mạng nào.
 */
class IngestArticleController extends Controller
{
    public function __invoke(Request $request)
    {
        $data = $request->validate([
            'topic'             => ['required', 'string', 'max:40'],
            'topic_name'        => ['nullable', 'string', 'max:80'],
            'items'             => ['required', 'array', 'min:1', 'max:500'],
            'items.*.title'     => ['required', 'string', 'max:500'],
            'items.*.summary'   => ['nullable', 'string'],
            'items.*.url'       => ['nullable', 'string', 'max:1000'],
            'items.*.image'     => ['nullable', 'string', 'max:1000'],
            'items.*.source'    => ['nullable', 'string', 'max:80'],
            'items.*.score'     => ['nullable', 'numeric'],
            'items.*.published' => ['nullable', 'date'],
        ]);

        $category = $this->categoryFor($data['topic'], $data['topic_name'] ?? null);

        // Lấy sẵn các vân tay đã có, một truy vấn thay vì 350 truy vấn
        $fingerprints = collect($data['items'])
            ->mapWithKeys(fn ($i) => [$i['title'] => Article::fingerprint($i['title'])]);
        $existing = Article::whereIn('fingerprint', $fingerprints->values())
            ->pluck('fingerprint')->flip();

        $rows = [];
        $skipped = 0;
        $seen = [];

        foreach ($data['items'] as $item) {
            $fp = $fingerprints[$item['title']];

            // Đã có tin này (báo khác đăng, hoặc lần chạy trước) thì bỏ qua.
            // Cố ý KHÔNG cập nhật: tin đã đăng thì giữ nguyên, tránh việc ngày
            // nào bài cũng bị đánh dấu "vừa sửa" trong mắt Google.
            if ($existing->has($fp) || isset($seen[$fp])) {
                $skipped++;
                continue;
            }
            $seen[$fp] = true;

            $rows[] = [
                'category_id'  => $category?->id,
                'topic'        => $data['topic'],
                'title'        => $item['title'],
                'slug'         => Article::makeSlug($item['title']),
                'excerpt'      => $item['summary'] ?? null,
                'image_url'    => $item['image'] ?? null,
                'source'       => $item['source'] ?? null,
                'source_url'   => $item['url'] ?? null,
                'fingerprint'  => $fp,
                'score'        => $item['score'] ?? null,
                'status'       => 'published',
                'published_at' => ! empty($item['published']) ? $item['published'] : now(),
                'created_at'   => now(),
                'updated_at'   => now(),
            ];
        }

        foreach (array_chunk($rows, 100) as $chunk) {
            Article::insertOrIgnore($chunk);
        }

        // Trang chủ, RSS và sitemap đang cache — có tin mới thì phải dọn
        foreach (['home.v1', 'feed.rss', 'sitemap.index', 'sitemap.cats'] as $key) {
            Cache::forget($key);
        }

        return response()->json([
            'added'    => count($rows),
            'skipped'  => $skipped,
            'category' => $category?->slug,
        ], 201);
    }

    /** Chuyên mục tương ứng chủ đề; chưa có thì tạo để không mất tin. */
    private function categoryFor(string $topic, ?string $name): ?Category
    {
        return Category::firstOrCreate(
            ['topic' => $topic],
            ['slug' => $topic, 'name' => $name ?: ucfirst($topic), 'color' => '#FE2C55', 'sort' => 100]
        );
    }
}
