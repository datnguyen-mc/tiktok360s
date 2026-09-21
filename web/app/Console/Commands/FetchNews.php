<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Services\NewsFetcher;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class FetchNews extends Command
{
    protected $signature = 'news:fetch {--category= : Chỉ lấy cho một chuyên mục (slug)}';

    protected $description = 'Lấy tin RSS cho các chuyên mục có khai nguồn';

    public function handle(NewsFetcher $fetcher): int
    {
        $categories = Category::active()
            ->whereNotNull('sources')
            ->when($this->option('category'), fn ($q, $s) => $q->where('slug', $s))
            ->get();

        if ($categories->isEmpty()) {
            $this->warn('Không có chuyên mục nào khai nguồn RSS.');

            return self::SUCCESS;
        }

        $total = 0;
        foreach ($categories as $c) {
            $r = $fetcher->fetch($c);
            $total += $r['added'];

            $note = $r['failed'] ? " · {$r['failed']} nguồn lỗi" : '';
            $body = ! empty($r['content']) ? " · {$r['content']} bài có nội dung" : '';
            $this->line(sprintf('  %-12s +%-4d mới, bỏ %-4d trùng%s%s',
                $c->slug, $r['added'], $r['skipped'], $body, $note));
        }

        if ($total > 0) {
            foreach (['home.v1', 'feed.rss', 'sitemap.index', 'sitemap.cats'] as $k) {
                Cache::forget($k);
            }
        }

        $this->info("Tổng: {$total} bài mới.");

        return self::SUCCESS;
    }
}
