<?php

namespace App\Http\Middleware;

use App\Models\Visit;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ghi lại lượt xem trang công khai.
 *
 * Tại sao tự ghi mà không chỉ dựa vào Google Analytics: GA bị chặn bởi phần lớn
 * trình chặn quảng cáo, và số liệu của nó không dùng được trong truy vấn SQL để
 * ghép với bài viết, chuyên mục hay bình luận. Bảng này nhỏ và tự bị dọn.
 *
 * KHÔNG lưu IP thô — chỉ lưu một mã băm của phiên, đủ để đếm người truy cập
 * riêng biệt trong ngày mà không giữ dữ liệu định danh.
 */
class TrackVisit
{
    /** Đường dẫn không tính là "lượt xem trang". */
    private const SKIP = ['admin', 'api', 'login', 'register', 'logout',
                          'account', 'bookmarks', 'up', 'metrics'];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($this->shouldTrack($request, $response)) {
            // Ghi sau khi đã trả lời xong — người đọc không phải chờ lệnh INSERT.
            //
            // Dùng `terminating()` chứ KHÔNG dùng `dispatch(...)->afterResponse()`:
            // dispatch một closure sẽ cố tuần tự hoá nó, mà closure này giữ tham
            // chiếu tới request nên kéo theo cả kết nối PDO — và PDO thì không
            // tuần tự hoá được, lượt truy cập âm thầm mất sạch.
            app()->terminating(function () use ($request) {
                try {
                    $this->record($request);
                } catch (\Throwable $e) {
                    // Số liệu hỏng không được làm hỏng trang. Ghi log rồi thôi.
                    report($e);
                }
            });
        }

        return $response;
    }

    private function shouldTrack(Request $request, Response $response): bool
    {
        if (! $request->isMethod('GET') || $request->ajax()) {
            return false;
        }
        if ($response->getStatusCode() !== 200) {
            return false;
        }
        // Điều hướng nội bộ của Inertia vẫn là một lượt xem trang thật, nhưng
        // tệp máy đọc (RSS, sitemap, robots) thì không.
        if ($request->is('*.xml', '*.txt', '*.ico', 'build/*')) {
            return false;
        }

        $first = $request->segment(1);

        return ! in_array($first, self::SKIP, true);
    }

    private function record(Request $request): void
    {
        $first = $request->segment(1);

        $kind = match (true) {
            $first === null        => 'home',
            $first === 'news'     => 'article',
            $first === 'category' => 'category',
            $first === 'search'   => 'search',
            $first === 'page'     => 'page',
            default                => 'other',
        };

        $ua = (string) $request->userAgent();

        Visit::create([
            'path'          => mb_substr($request->path(), 0, 255),
            'kind'          => $kind,
            'article_id'    => $kind === 'article' ? $this->articleId($request) : null,
            'user_id'       => $request->user()?->id,
            'visitor'       => hash('xxh128', $request->session()->getId()),
            'referrer_host' => $this->referrerHost($request),
            'device'        => match (true) {
                (bool) preg_match('/iPad|Tablet/i', $ua)                   => 'tablet',
                (bool) preg_match('/Mobi|Android|iPhone|iPod/i', $ua)      => 'mobile',
                default                                                     => 'desktop',
            },
        ]);
    }

    private function articleId(Request $request): ?int
    {
        $article = $request->route('article');

        return is_object($article) ? $article->id : null;
    }

    /** Chỉ giữ tên miền giới thiệu, và bỏ qua khi người đọc đi từ chính site này. */
    private function referrerHost(Request $request): ?string
    {
        $ref = $request->headers->get('referer');
        if (! $ref) {
            return null;
        }

        $host = parse_url($ref, PHP_URL_HOST);
        if (! $host || $host === $request->getHost()) {
            return null;
        }

        return mb_substr(preg_replace('/^www\./', '', $host), 0, 120);
    }
}
