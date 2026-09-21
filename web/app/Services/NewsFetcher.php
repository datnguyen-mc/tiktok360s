<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use SimpleXMLElement;
use Throwable;

/**
 * Lấy tin RSS cho một chuyên mục.
 *
 * Tách khỏi dây chuyền video có chủ đích: website cần nhiều chuyên mục hơn số
 * chủ đề làm video, và chuyên mục Công nghệ hay Thế giới thì không cần giọng
 * đọc, phụ đề hay câu cảm thán — chỉ cần tin.
 */
class NewsFetcher
{
    private const UA = 'Mozilla/5.0 (compatible; Tin360sBot/1.0)';
    private const MAX_AGE_HOURS = 48;

    /**
     * Số bài lấy nội dung đầy đủ mỗi lượt chạy.
     *
     * Mỗi bài là một lần tải trang gốc — không giới hạn thì một lượt `news:fetch`
     * sẽ bắn hàng trăm request vào máy chủ của báo. Bài mới nhất được ưu tiên.
     */
    private const CONTENT_BUDGET = 25;

    public function __construct(private ContentExtractor $extractor) {}

    /** @return array{added:int, skipped:int, failed:int} */
    public function fetch(Category $category): array
    {
        $sources = $category->sources ?: [];
        if (! $sources) {
            return ['added' => 0, 'skipped' => 0, 'failed' => 0];
        }

        $items = [];
        $failed = 0;
        foreach ($sources as $src) {
            try {
                $items = array_merge($items, $this->readFeed($src['url'], $src['name'] ?? '?'));
            } catch (Throwable) {
                // Một báo đổi địa chỉ RSS không được làm hỏng cả chuyên mục
                $failed++;
            }
        }

        $items = $this->filter($items, $category);
        $result = $this->store($items, $category);

        if ($category->content_paragraphs > 0) {
            $result['content'] = $this->fillContent($category);
        }

        return [...$result, 'failed' => $failed];
    }

    /**
     * Lấy nội dung đầy đủ cho các bài chưa có, trong hạn mức cho phép.
     * Chạy sau khi lưu để chỉ tải trang gốc của bài thật sự mới.
     */
    private function fillContent(Category $category): int
    {
        $pending = Article::where('category_id', $category->id)
            ->whereNull('content')
            ->whereNotNull('source_url')
            ->latest('published_at')
            ->limit(self::CONTENT_BUDGET)
            ->get(['id', 'source_url', 'image_url']);

        $done = 0;
        foreach ($pending as $a) {
            $r = $this->extractor->extract($a->source_url, $category->content_paragraphs);
            if (! $r['content']) {
                continue;
            }

            $a->update([
                'content'   => $r['content'],
                // Ảnh og: thường nét hơn ảnh thumbnail trong RSS
                'image_url' => $a->image_url ?: $r['image'],
            ]);
            $done++;
        }

        return $done;
    }

    /** @return list<array> */
    private function readFeed(string $url, string $source): array
    {
        $body = Http::withHeaders(['User-Agent' => self::UA])->timeout(20)->get($url)->body();

        // libxml ném cảnh báo với RSS không chuẩn — tắt để tự xử lý bằng exception
        $prev = libxml_use_internal_errors(true);
        $xml = new SimpleXMLElement($body, LIBXML_NOCDATA | LIBXML_NOWARNING | LIBXML_NOERROR);
        libxml_use_internal_errors($prev);

        $cutoff = now()->subHours(self::MAX_AGE_HOURS);
        $out = [];

        foreach ($xml->channel->item ?? [] as $item) {
            $title = trim(html_entity_decode((string) $item->title));
            $link = trim((string) $item->link);
            if ($title === '' || $link === '') {
                continue;
            }

            $published = $this->parseDate((string) $item->pubDate);
            if ($published && $published->lt($cutoff)) {
                continue;
            }

            $description = (string) $item->description;

            $out[] = [
                'title'     => $title,
                'summary'   => $this->cleanSummary($description),
                'url'       => $link,
                'image'     => $this->extractImage($item, $description),
                'source'    => $source,
                'published' => $published ?: now(),
            ];
        }

        return $out;
    }

    private function parseDate(string $raw): ?\Illuminate\Support\Carbon
    {
        if ($raw === '') {
            return null;
        }
        try {
            return \Illuminate\Support\Carbon::parse($raw);
        } catch (Throwable) {
            return null;
        }
    }

    /** Sapo trong RSS thường lẫn thẻ HTML và tiền tố toà soạn. */
    private function cleanSummary(string $raw): ?string
    {
        $text = trim(html_entity_decode(strip_tags($raw)));
        // "(Dân trí) - ", "TPO - " ở đầu sapo đọc lên rất kỳ
        $text = preg_replace('/^\s*(?:\([^)]{1,24}\)|TPO|TTO|PLO|VOV)\s*[-–—:,]*\s*/iu', '', $text);

        return Str::limit(trim($text), 500) ?: null;
    }

    private function extractImage(SimpleXMLElement $item, string $description): ?string
    {
        foreach ($item->enclosure ?? [] as $enc) {
            $type = (string) $enc['type'];
            if (str_contains($type, 'image') && (string) $enc['url'] !== '') {
                return (string) $enc['url'];
            }
        }

        $media = $item->children('http://search.yahoo.com/mrss/');
        foreach (['content', 'thumbnail'] as $tag) {
            if (isset($media->$tag) && (string) $media->$tag->attributes()->url !== '') {
                return (string) $media->$tag->attributes()->url;
            }
        }

        if (preg_match('/<img[^>]+src=["\']([^"\']+)["\']/i', $description, $m)) {
            return $m[1];
        }

        return null;
    }

    /** Lọc theo từ khoá của chuyên mục — cần khi feed nguồn rộng hơn chuyên mục. */
    private function filter(array $items, Category $category): array
    {
        $require = array_map('mb_strtolower', $category->require_keywords ?: []);
        $exclude = array_map('mb_strtolower', $category->exclude_keywords ?: []);

        return array_values(array_filter($items, function ($it) use ($require, $exclude) {
            $hay = mb_strtolower($it['title'].' '.($it['summary'] ?? ''));

            foreach ($exclude as $k) {
                if (str_contains($hay, $k)) {
                    return false;
                }
            }
            if (! $require) {
                return true;
            }
            foreach ($require as $k) {
                if (str_contains($hay, $k)) {
                    return true;
                }
            }

            return false;
        }));
    }

    /** @return array{added:int, skipped:int} */
    private function store(array $items, Category $category): array
    {
        if (! $items) {
            return ['added' => 0, 'skipped' => 0];
        }

        $prints = collect($items)->mapWithKeys(
            fn ($i) => [$i['title'] => Article::fingerprint($i['title'])]
        );
        $existing = Article::whereIn('fingerprint', $prints->values())->pluck('fingerprint')->flip();

        $rows = [];
        $seen = [];
        $skipped = 0;

        foreach ($items as $it) {
            $fp = $prints[$it['title']];
            if ($existing->has($fp) || isset($seen[$fp])) {
                $skipped++;
                continue;
            }
            $seen[$fp] = true;

            $rows[] = [
                'category_id'  => $category->id,
                'topic'        => $category->topic,
                'title'        => Str::limit($it['title'], 480, ''),
                'slug'         => Article::makeSlug($it['title']),
                'excerpt'      => $it['summary'],
                'image_url'    => $it['image'],
                'source'       => $it['source'],
                'source_url'   => $it['url'],
                'fingerprint'  => $fp,
                'status'       => 'published',
                'published_at' => $it['published'],
                'created_at'   => now(),
                'updated_at'   => now(),
            ];
        }

        foreach (array_chunk($rows, 100) as $chunk) {
            Article::insertOrIgnore($chunk);
        }

        $category->update(['fetched_at' => now()]);

        return ['added' => count($rows), 'skipped' => $skipped];
    }
}
