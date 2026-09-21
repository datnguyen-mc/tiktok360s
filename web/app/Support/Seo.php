<?php

namespace App\Support;

use Illuminate\Support\Str;

/**
 * Gom toàn bộ thẻ SEO của một trang.
 *
 * Vì sao cần lớp này thay vì rải thẻ khắp nơi: một trang tin cần đồng thời
 * title, description, canonical, Open Graph, Twitter Card và JSON-LD — tất cả
 * nói cùng một điều. Viết tay từng chỗ là chắc chắn sẽ lệch.
 */
class Seo
{
    public function __construct(
        public string $title,
        public ?string $description = null,
        public ?string $image = null,
        public ?string $canonical = null,
        public string $type = 'website',
        public ?string $publishedAt = null,
        public ?string $modifiedAt = null,
        public ?string $section = null,
        public array $jsonLd = [],
        public bool $noindex = false,
    ) {}

    /** Mảng truyền sang Inertia để lớp Vue dựng thẻ. */
    public function toArray(): array
    {
        $site = config('site.name');
        $desc = Str::limit(strip_tags((string) $this->description), 300);

        return [
            'title'       => $this->title === $site ? $site : "{$this->title} · {$site}",
            'description' => $desc ?: config('site.tagline'),
            'image'       => $this->image ?: url(config('site.logo')),
            'canonical'   => $this->canonical ?: url()->current(),
            'type'        => $this->type,
            'locale'      => config('site.locale'),
            'siteName'    => $site,
            'noindex'     => $this->noindex,
            'publishedAt' => $this->publishedAt,
            'modifiedAt'  => $this->modifiedAt,
            'section'     => $this->section,
            'jsonLd'      => $this->jsonLd ?: null,
        ];
    }

    /** Dữ liệu có cấu trúc cho một bài báo — Google dùng để hiện Top stories. */
    public static function newsArticle(array $a): array
    {
        return array_filter([
            '@context'         => 'https://schema.org',
            '@type'            => 'NewsArticle',
            'headline'         => Str::limit($a['title'], 110, ''),
            'description'      => $a['excerpt'] ?? null,
            'image'            => array_filter([$a['image_url'] ?? null]),
            'datePublished'    => $a['published_at'] ?? null,
            'dateModified'     => $a['updated_at'] ?? ($a['published_at'] ?? null),
            'articleSection'   => $a['category'] ?? null,
            'mainEntityOfPage' => ['@type' => 'WebPage', '@id' => $a['url'] ?? null],
            'publisher'        => [
                '@type' => 'Organization',
                'name'  => config('site.name'),
                'logo'  => ['@type' => 'ImageObject', 'url' => url(config('site.logo'))],
            ],
        ]);
    }

    public static function breadcrumbs(array $items): array
    {
        return [
            '@context'        => 'https://schema.org',
            '@type'           => 'BreadcrumbList',
            'itemListElement' => collect($items)->values()->map(fn ($it, $i) => [
                '@type'    => 'ListItem',
                'position' => $i + 1,
                'name'     => $it['name'],
                'item'     => $it['url'],
            ])->all(),
        ];
    }
}
