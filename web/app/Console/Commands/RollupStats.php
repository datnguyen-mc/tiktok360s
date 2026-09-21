<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\Comment;
use App\Models\DailyStat;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Gom lượt truy cập thô thành một dòng mỗi ngày.
 *
 * Chạy 10 phút một lần và luôn tính lại NGUYÊN ngày, không cộng dồn: cộng dồn
 * thì một lần chạy lỗi hoặc chạy hai lần là số sai vĩnh viễn, mà không có cách
 * nào biết. Tính lại thì lần chạy nào cũng cho ra kết quả đúng.
 */
class RollupStats extends Command
{
    protected $signature = 'stats:rollup
                            {--days=2 : Số ngày gần nhất cần tính lại}
                            {--prune=30 : Xoá lượt truy cập thô cũ hơn N ngày}';

    protected $description = 'Gom lượt truy cập thành số liệu theo ngày';

    public function handle(): int
    {
        $days = max(1, (int) $this->option('days'));

        for ($i = 0; $i < $days; $i++) {
            $date = today()->subDays($i);
            $this->rollup($date);
        }

        $this->prune();

        return self::SUCCESS;
    }

    private function rollup(Carbon $date): void
    {
        $from = $date->copy()->startOfDay();
        $to   = $date->copy()->endOfDay();

        $base = fn () => Visit::whereBetween('visits.created_at', [$from, $to]);

        $views    = $base()->count();
        $visitors = $base()->distinct('visits.visitor')->count('visits.visitor');

        // Lượt xem theo giờ — mảng 24 phần tử, giờ nào không có thì là 0, để
        // biểu đồ không bị thủng cột giữa chừng.
        $byHour = array_fill(0, 24, 0);
        foreach ($base()->select(DB::raw('HOUR(visits.created_at) h'), DB::raw('COUNT(*) n'))
            ->groupBy('h')->get() as $r) {
            $byHour[(int) $r->h] = (int) $r->n;
        }

        $pairs = fn ($column, $limit = null) => $base()
            ->whereNotNull('visits.'.$column)
            ->select($column, DB::raw('COUNT(*) n'))
            ->groupBy($column)->orderByDesc('n')
            ->when($limit, fn ($q) => $q->limit($limit))
            ->pluck('n', $column)->map(fn ($n) => (int) $n)->all();

        // Bài đọc nhiều trong ngày — kèm tiêu đề để báo cáo không phải nối bảng
        $top = $base()->whereNotNull('visits.article_id')
            ->select('visits.article_id', DB::raw('COUNT(*) n'))
            ->groupBy('visits.article_id')->orderByDesc('n')->limit(10)->get();

        $titles = Article::whereIn('id', $top->pluck('article_id'))
            ->pluck('title', 'id');

        $byCategory = $base()->whereNotNull('visits.article_id')
            ->join('articles', 'articles.id', '=', 'visits.article_id')
            ->leftJoin('categories', 'categories.id', '=', 'articles.category_id')
            ->select('categories.name', DB::raw('COUNT(*) n'))
            ->groupBy('categories.name')->orderByDesc('n')
            ->pluck('n', 'name')->map(fn ($n) => (int) $n)->all();

        DailyStat::updateOrCreate(['date' => $date->toDateString()], [
            'views'         => $views,
            'visitors'      => $visitors,
            'article_views' => $base()->where('visits.kind', 'article')->count(),
            'searches'      => $base()->where('visits.kind', 'search')->count(),
            'new_users'     => User::whereBetween('created_at', [$from, $to])->count(),
            'new_articles'  => Article::whereBetween('published_at', [$from, $to])->count(),
            'comments'      => Comment::whereBetween('created_at', [$from, $to])->count(),
            'likes'         => DB::table('article_likes')
                                 ->whereBetween('created_at', [$from, $to])->count(),
            'by_hour'       => $byHour,
            'by_device'     => $pairs('device'),
            'by_referrer'   => $pairs('referrer_host', 10),
            'by_category'   => $byCategory,
            'top_articles'  => $top->map(fn ($r) => [
                'id'    => $r->article_id,
                'title' => $titles[$r->article_id] ?? '(bài đã xoá)',
                'views' => (int) $r->n,
            ])->all(),
            'rolled_at'     => now(),
        ]);

        $this->line(sprintf('  %s · %s lượt xem · %s khách',
            $date->format('d/m'), number_format($views), number_format($visitors)));
    }

    /** Số đã gom rồi thì bản thô không còn giá trị — xoá để bảng không phình. */
    private function prune(): void
    {
        $keep = max(2, (int) $this->option('prune'));
        $cut  = today()->subDays($keep);

        $n = Visit::where('created_at', '<', $cut)->delete();

        if ($n) {
            $this->line("  đã dọn {$n} lượt truy cập thô cũ hơn {$keep} ngày");
        }
    }
}
