<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\Comment;
use App\Models\DailyStat;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $since = now()->subDays(13)->startOfDay();
        $user  = $request->user();

        // Ẩn ở giao diện thôi thì chưa đủ: số liệu vẫn nằm trong payload JSON và
        // ai mở tab Network cũng đọc được. Không có quyền thì không truy vấn.
        $seeArticles = $user->hasPermission('articles.view');
        $seeComments = $user->hasPermission('comments.view');
        $seeUsers    = $user->hasPermission('users.view');
        $seeReports  = $user->hasPermission('reports.view');

        return Inertia::render('Admin/Dashboard', [
            'can' => [
                'articles'   => $seeArticles,
                'comments'   => $seeComments,
                'categories' => $user->hasPermission('categories.view'),
                'reports'    => $seeReports,
            ],

            // Tóm tắt truy cập — đủ để biết hôm nay có gì bất thường, muốn xem
            // kỹ thì sang trang Báo cáo.
            'traffic' => ! $seeReports ? null : [
                'online'   => Visit::where('created_at', '>=', now()->subMinutes(5))
                                ->distinct('visitor')->count('visitor'),
                'today'    => Visit::whereDate('created_at', today())->count(),
                'visitors' => Visit::whereDate('created_at', today())
                                ->distinct('visitor')->count('visitor'),
                'series'   => $this->trafficSeries($since),
                'rolledAt' => DailyStat::orderByDesc('date')->value('rolled_at'),
            ],
            'kpi' => [
                'articles'   => $seeArticles ? Article::count() : null,
                'today'      => $seeArticles ? Article::whereDate('published_at', today())->count() : null,
                'views'      => $seeArticles ? (int) Article::sum('views') : null,
                'users'      => $seeUsers ? User::where('role', 'reader')->count() : null,
                'comments'   => $seeComments ? Comment::count() : null,
                'pending'    => $seeComments ? Comment::where('status', 'spam')->count() : null,
                'likes'      => $seeArticles ? (int) Article::sum('likes_count') : null,
                'bookmarks'  => $seeArticles ? (int) Article::sum('bookmarks_count') : null,
            ],

            // Bài đăng theo ngày — thấy ngay hôm nào bộ lấy tin không chạy
            'daily' => ! $seeArticles ? [] : Article::where('published_at', '>=', $since)
                ->select(DB::raw('DATE(published_at) as d'), DB::raw('COUNT(*) as n'))
                ->groupBy('d')->orderBy('d')->get()
                ->map(fn ($r) => ['date' => $r->d, 'count' => (int) $r->n])->all(),

            'byCategory' => ! $seeArticles ? [] : Category::active()
                ->withCount(['articles' => fn ($q) => $q->where('status', 'published')])
                ->get(['id', 'name', 'slug', 'color', 'fetched_at'])
                ->map(fn ($c) => [
                    ...$c->only(['name', 'slug', 'color']),
                    'count'      => $c->articles_count,
                    'fetched_at' => $c->fetched_at,
                ])->all(),

            'topArticles' => ! $seeArticles ? [] : Article::published()
                ->orderByDesc('views')->limit(8)
                ->get(['id', 'title', 'slug', 'views', 'likes_count', 'comments_count'])->all(),

            'recentComments' => ! $seeComments ? [] : Comment::with(['user:id,name', 'article:id,title,slug'])
                ->latest('id')->limit(6)->get()->all(),
        ]);
    }

    /**
     * Lượt xem 14 ngày. Ngày chưa có dòng vẫn phải có mặt với số 0 — thiếu ngày
     * thì biểu đồ nối liền hai ngày cách nhau và che mất ngày website chết.
     */
    private function trafficSeries($since): array
    {
        $rows = DailyStat::where('date', '>=', $since)->orderBy('date')->get()
            ->keyBy(fn ($r) => $r->date->toDateString());

        $out = [];
        for ($d = $since->copy(); $d <= today(); $d->addDay()) {
            $r = $rows->get($d->toDateString());
            $out[] = [
                'date'     => $d->toDateString(),
                'views'    => $r?->views ?? 0,
                'visitors' => $r?->visitors ?? 0,
            ];
        }

        return $out;
    }
}
