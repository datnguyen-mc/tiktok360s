<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Services\NewsFetcher;
use Illuminate\Console\Command;
use App\Models\Article;

/**
 * Lấy nội dung và ảnh cho những bài đã có trong kho mà còn thiếu.
 *
 * Tách khỏi `news:fetch` vì hai việc khác nhau: lấy tin mới phải nhanh và chạy
 * thường xuyên, còn dọn nợ cũ thì chạy chậm, chạy nhiều lượt cũng được.
 */
class BackfillContent extends Command
{
    protected $signature = 'news:backfill
                            {--category= : Chỉ một chuyên mục (slug)}
                            {--limit=50 : Số bài mỗi chuyên mục mỗi lượt}
                            {--loop=1 : Lặp bao nhiêu lượt}';

    protected $description = 'Bổ sung nội dung và ảnh cho bài còn thiếu';

    public function handle(NewsFetcher $fetcher): int
    {
        $categories = Category::active()
            ->when($this->option('category'), fn ($q, $s) => $q->where('slug', $s))
            ->get();

        if ($categories->isEmpty()) {
            $this->warn('Không có chuyên mục nào.');

            return self::FAILURE;
        }

        $limit = max(1, (int) $this->option('limit'));
        $loops = max(1, (int) $this->option('loop'));

        for ($i = 1; $i <= $loops; $i++) {
            $loops > 1 && $this->line("── lượt {$i}/{$loops} ──");

            foreach ($categories as $cat) {
                $missing = $this->missing($cat->id);
                if ($missing === 0) {
                    $this->line(sprintf('  %-12s đủ cả nội dung lẫn ảnh', $cat->slug));
                    continue;
                }

                $done = $fetcher->fillContent($cat, $limit);

                $this->line(sprintf('  %-12s +%d bài  (còn thiếu %d)',
                    $cat->slug, $done, max(0, $missing - $done)));
            }
        }

        $this->newLine();
        $this->info(sprintf('Còn %s bài thiếu nội dung hoặc ảnh trên toàn site.',
            number_format($this->missing())));

        return self::SUCCESS;
    }

    private function missing(?int $categoryId = null): int
    {
        return Article::when($categoryId, fn ($q, $id) => $q->where('category_id', $id))
            ->whereNotNull('source_url')
            ->where(fn ($q) => $q->whereNull('content')->orWhereNull('image_url'))
            ->count();
    }
}
