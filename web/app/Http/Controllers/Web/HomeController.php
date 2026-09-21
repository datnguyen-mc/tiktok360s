<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Concerns\WithSidebar;
use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Support\Seo;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    use WithSidebar;

    public function __invoke(): Response
    {
        // Trang chủ là trang bị gọi nhiều nhất và nội dung chỉ đổi khi có tin mới
        // — cache 5 phút cắt phần lớn truy vấn mà vẫn đủ tươi cho một trang tin.
        $data = Cache::remember('home.v6', now()->addMinutes(5), function () {
            // Băng chuyền đầu trang: ưu tiên bài được cắm cờ nổi bật, nhưng chỉ
            // lấy bài CÓ ẢNH — một slide không ảnh là một mảng xám to đùng.
            $slider = Article::published()->with('category:id,slug,name,color')
                ->where('is_featured', true)
                ->whereNotNull('image_url')
                ->latest('published_at')->limit(5)->get();

            // Chưa cắm cờ bài nào thì tự lấy tin mới nhất có ảnh, để trang chủ
            // không bao giờ trống phần đầu.
            if ($slider->count() < 5) {
                $slider = $slider->concat(
                    Article::published()->with('category:id,slug,name,color')
                        ->whereNotNull('image_url')
                        ->whereNotIn('id', $slider->pluck('id'))
                        ->latest('published_at')
                        ->limit(5 - $slider->count())->get()
                );
            }

            // Cột tiêu đề bên phải băng chuyền — chỉ có chữ, không ảnh, nên
            // lấy được nhiều tin trong ít chỗ.
            $headlines = Article::published()->with('category:id,slug,name,color')
                ->whereNotIn('id', $slider->pluck('id'))
                ->latest('published_at')->limit(6)->get();

            $latest = Article::published()->with('category:id,slug,name,color')
                ->whereNotIn('id', $slider->pluck('id')->merge($headlines->pluck('id')))
                ->latest('published_at')->limit(14)->get();

            $blocks = Category::active()->get()->map(function ($cat) {
                return [
                    'category' => $cat->only(['slug', 'name', 'color', 'description']),
                    'articles' => Article::published()->where('category_id', $cat->id)
                        ->latest('published_at')->limit(6)
                        ->get(['id', 'title', 'slug', 'excerpt', 'image_url', 'source', 'published_at',
                               'views', 'likes_count', 'comments_count', 'shares_count'])
                        ->all(),
                ];
            })->filter(fn ($b) => count($b['articles']) > 0)->values();

            return compact('slider', 'headlines', 'latest', 'blocks');
        });

        return Inertia::render('Home', [
            ...$data,
            'sidebar' => $this->sidebar(),
            'seo' => (new Seo(
                title: config('site.name'),
                description: config('site.tagline').' — tin showbiz, bóng đá và giải trí cập nhật liên tục.',
                canonical: url('/'),
                jsonLd: [
                    '@context' => 'https://schema.org',
                    '@type'    => 'WebSite',
                    'name'     => config('site.name'),
                    'url'      => url('/'),
                    'potentialAction' => [
                        '@type'       => 'SearchAction',
                        'target'      => url('/search').'?q={search_term_string}',
                        'query-input' => 'required name=search_term_string',
                    ],
                ],
            ))->toArray(),
        ]);
    }
}
