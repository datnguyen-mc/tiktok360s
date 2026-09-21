<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

/**
 * Các tệp máy đọc: sitemap, robots, RSS.
 *
 * Đây là phần SEO mà người dùng không bao giờ thấy nhưng Google đọc đầu tiên.
 * Cache lại vì chúng bị gọi thường xuyên bởi bot và nội dung chỉ đổi khi có tin mới.
 */
class FeedController extends Controller
{
    /** robots.txt — chặn những đường không đáng lập chỉ mục. */
    public function robots(): Response
    {
        $lines = [
            'User-agent: *',
            'Allow: /',
            'Disallow: /admin',      // khu quản trị
            'Disallow: /search',      // trang kết quả tìm kiếm
            'Disallow: /*?page=',       // trang 2,3… trùng nội dung trang 1
            '',
            'Sitemap: '.url('/sitemap.xml'),
        ];

        return response(implode("\n", $lines), 200, ['Content-Type' => 'text/plain']);
    }

    /**
     * Sitemap chỉ mục, trỏ tới các sitemap con.
     * Chia nhỏ vì chuẩn cho tối đa 50.000 URL mỗi tệp, và tệp nhỏ thì bot đọc nhanh hơn.
     */
    public function sitemapIndex(): Response
    {
        $xml = Cache::remember('sitemap.index', now()->addHour(), function () {
            $pages = (int) ceil(Article::published()->count() / config('site.sitemap_limit'));
            $urls = ['<sitemap><loc>'.e(url('/sitemap-categories.xml')).'</loc></sitemap>'];
            for ($i = 1; $i <= max(1, $pages); $i++) {
                $last = Article::published()->latest('published_at')->value('published_at');
                $urls[] = '<sitemap><loc>'.e(url("/sitemap-news-{$i}.xml")).'</loc>'
                        .($last ? '<lastmod>'.$last->toAtomString().'</lastmod>' : '').'</sitemap>';
            }

            return '<?xml version="1.0" encoding="UTF-8"?>'
                 .'<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
                 .implode('', $urls).'</sitemapindex>';
        });

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }

    public function sitemapCategories(): Response
    {
        $xml = Cache::remember('sitemap.cats', now()->addHour(), function () {
            $urls = ['<url><loc>'.e(url('/')).'</loc><changefreq>hourly</changefreq>'
                    .'<priority>1.0</priority></url>'];
            foreach (Category::active()->get() as $c) {
                $urls[] = '<url><loc>'.e($c->url()).'</loc>'
                        .'<changefreq>hourly</changefreq><priority>0.8</priority></url>';
            }

            return $this->wrap($urls);
        });

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }

    public function sitemapArticles(int $page = 1): Response
    {
        $limit = config('site.sitemap_limit');

        $xml = Cache::remember("sitemap.articles.{$page}", now()->addHour(), function () use ($page, $limit) {
            $urls = Article::published()
                ->latest('published_at')
                ->forPage($page, $limit)
                ->get(['slug', 'published_at', 'updated_at', 'image_url'])
                ->map(function ($a) {
                    $img = $a->image_url
                        ? '<image:image><image:loc>'.e($a->image_url).'</image:loc></image:image>'
                        : '';

                    return '<url><loc>'.e(url("/news/{$a->slug}")).'</loc>'
                         .'<lastmod>'.$a->updated_at->toAtomString().'</lastmod>'
                         .'<changefreq>daily</changefreq><priority>0.6</priority>'
                         .$img.'</url>';
                })->all();

            return $this->wrap($urls, true);
        });

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }

    /** RSS — để người đọc và các trình tổng hợp theo dõi. */
    public function rss(): Response
    {
        $xml = Cache::remember('feed.rss', now()->addMinutes(15), function () {
            $items = Article::published()->with('category:id,name')
                ->latest('published_at')->limit(config('site.feed_limit'))->get()
                ->map(fn ($a) => '<item>'
                    .'<title>'.e($a->title).'</title>'
                    .'<link>'.e($a->url()).'</link>'
                    .'<guid isPermaLink="true">'.e($a->url()).'</guid>'
                    .'<pubDate>'.$a->published_at->toRfc2822String().'</pubDate>'
                    .($a->category ? '<category>'.e($a->category->name).'</category>' : '')
                    .'<description><![CDATA['.($a->excerpt ?: '').']]></description>'
                    .'</item>')->implode('');

            return '<?xml version="1.0" encoding="UTF-8"?>'
                 .'<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>'
                 .'<title>'.e(config('site.name')).'</title>'
                 .'<link>'.e(url('/')).'</link>'
                 .'<description>'.e(config('site.tagline')).'</description>'
                 .'<language>vi-VN</language>'
                 .'<atom:link href="'.e(url('/rss.xml')).'" rel="self" type="application/rss+xml"/>'
                 .$items.'</channel></rss>';
        });

        return response($xml, 200, ['Content-Type' => 'application/rss+xml; charset=UTF-8']);
    }

    private function wrap(array $urls, bool $withImages = false): string
    {
        $ns = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
            .($withImages ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : '');

        return '<?xml version="1.0" encoding="UTF-8"?><urlset '.$ns.'>'.implode('', $urls).'</urlset>';
    }
}
