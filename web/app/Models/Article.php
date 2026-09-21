<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Article extends Model
{
    protected $guarded = [];

    protected $casts = [
        'published_at' => 'datetime',
        'is_featured'  => 'boolean',
        'is_original'  => 'boolean',
        'score'        => 'float',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function comments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function likes(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ArticleLike::class);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    // ───────────────────────────────────────────────────────────── truy vấn

    public function scopePublished(Builder $q): Builder
    {
        return $q->where('status', 'published')
                 ->where('published_at', '<=', now());
    }

    /**
     * Tìm kiếm. Dùng FULLTEXT khi từ khoá đủ dài — MySQL bỏ qua từ dưới 4 ký tự
     * ở chế độ tự nhiên, nên từ ngắn phải lùi về LIKE.
     */
    public function scopeSearch(Builder $q, string $term): Builder
    {
        $term = trim($term);
        if ($term === '') {
            return $q;
        }

        if (mb_strlen($term) >= 4 && ! str_contains($term, '%')) {
            return $q->whereFullText(['title', 'excerpt'], $term);
        }

        return $q->where(fn ($w) => $w->where('title', 'like', "%{$term}%")
                                      ->orWhere('excerpt', 'like', "%{$term}%"));
    }

    // ───────────────────────────────────────────────────────────── tiện ích

    public function url(): string
    {
        return url("/news/{$this->slug}");
    }

    /**
     * Slug không dấu, kèm hậu tố chống trùng.
     *
     * Hậu tố là bắt buộc chứ không phải cho đẹp: nhiều báo giật cùng một tiêu đề,
     * và tiêu đề tiếng Việt bỏ dấu rất dễ đụng nhau ("Sơn Tùng ra MV" vs "Son
     * Tung ra MV"). Không có hậu tố thì bài mới ghi đè bài cũ.
     */
    public static function makeSlug(string $title, ?string $suffix = null): string
    {
        $base = Str::limit(Str::slug($title), 180, '');
        $base = $base ?: 'tin';

        return $base.'-'.($suffix ?: Str::lower(Str::random(6)));
    }

    /**
     * Hư từ tiếng Việt — không mang thông tin, chỉ làm lệch phép so trùng.
     * Viết không dấu vì fingerprint so trên chuỗi đã bỏ dấu.
     */
    private const STOPWORDS = [
        'cua', 'va', 'voi', 'cho', 'tai', 'trong', 'tren', 'duoi', 'khi', 'sau',
        'truoc', 'nhung', 'cac', 'mot', 'nay', 'do', 'den', 'tu', 'la', 'da',
        'se', 'bi', 'duoc', 'cung', 'van', 'con', 'ra', 'vao', 've', 'theo',
        'tho', 'moi',
    ];

    /**
     * Vân tay để chặn trùng giữa các báo và giữa các lần chạy.
     *
     * Bỏ dấu, bỏ hư từ, bỏ từ quá ngắn rồi SẮP XẾP — nhờ vậy "Sơn Tùng ra mắt MV"
     * và "MV của Sơn Tùng ra mắt" ra cùng một vân tay. Cùng một tin được năm báo
     * giật năm kiểu tiêu đề thì website chỉ đăng một lần.
     */
    public static function fingerprint(string $title): string
    {
        $words = array_filter(
            explode('-', Str::slug($title)),
            fn ($w) => mb_strlen($w) > 2 && ! in_array($w, self::STOPWORDS, true)
        );
        sort($words);

        return sha1(implode('-', $words));
    }

    public function readingMinutes(): int
    {
        $words = str_word_count(strip_tags((string) ($this->content ?: $this->excerpt)));

        return max(1, (int) ceil($words / 200));
    }
}
