<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\PublishJob;
use App\Models\Run;
use App\Models\RunItem;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __invoke(\Illuminate\Http\Request $request)
    {
        $since = now()->subDays(29)->startOfDay();
        $topic = $request->string('topic')->toString() ?: null;

        return response()->json([
            'kpi'      => $this->kpi($since, $topic),
            'duration' => $this->durationSeries($since, $topic),
            'sources'  => $this->sourceBreakdown($since, $topic),
            'recent'   => Run::with('publishJobs:id,run_id,status')
                              ->when($topic, fn ($q) => $q->where('topic', $topic))
                              ->latest('run_date')->latest('id')->limit(8)->get(),
            'activity' => ActivityLog::latest('id')->limit(12)->get(),
            'topics'   => Run::select('topic', 'topic_name')->distinct()
                              ->orderBy('topic')->get(),
        ]);
    }

    private function kpi(Carbon $since, ?string $topic = null): array
    {
        $runs = Run::where('run_date', '>=', $since)
                    ->when($topic, fn ($q) => $q->where('topic', $topic))->get();
        $ok   = $runs->where('status', 'success');

        return [
            'runs_total'     => $runs->count(),
            'runs_success'   => $ok->count(),
            'success_rate'   => $runs->count() ? round($ok->count() / $runs->count() * 100) : 0,
            'total_minutes'  => round($ok->sum('duration_sec') / 60, 1),
            'avg_duration'   => $ok->count() ? round($ok->avg('duration_sec'), 1) : 0,
            'items_used'     => RunItem::whereIn('run_id', $ok->pluck('id'))->count(),
            'published'      => PublishJob::where('status', 'published')
                                    ->where('created_at', '>=', $since)->count(),
            'pending'        => PublishJob::whereIn('status', PublishJob::IN_FLIGHT)->count(),
            // Sai số trung bình của mô hình ước lượng thời lượng
            'avg_drift'      => round($ok->filter(fn ($r) => $r->drift_sec !== null)
                                        ->avg(fn ($r) => abs($r->drift_sec)) ?? 0, 2),
        ];
    }

    /** Thời lượng thực tế so với ước lượng, theo ngày. */
    private function durationSeries(Carbon $since, ?string $topic = null): array
    {
        return Run::successful()
            ->when($topic, fn ($q) => $q->where('topic', $topic))
            ->where('run_date', '>=', $since)
            ->orderBy('run_date')
            ->get(['run_date', 'duration_sec', 'estimated_sec'])
            ->map(fn ($r) => [
                'date'      => $r->run_date->format('Y-m-d'),
                'actual'    => (float) $r->duration_sec,
                'estimated' => $r->estimated_sec !== null ? (float) $r->estimated_sec : null,
            ])->values()->all();
    }

    /** Mỗi báo đóng góp bao nhiêu tin — cho biết kênh đang phụ thuộc nguồn nào. */
    private function sourceBreakdown(Carbon $since, ?string $topic = null): array
    {
        return RunItem::join('runs', 'runs.id', '=', 'run_items.run_id')
            ->when($topic, fn ($q) => $q->where('runs.topic', $topic))
            ->where('runs.run_date', '>=', $since)
            ->whereNotNull('run_items.source')
            ->groupBy('run_items.source')
            ->orderByDesc(DB::raw('COUNT(*)'))
            ->get([DB::raw('run_items.source as source'), DB::raw('COUNT(*) as total')])
            ->map(fn ($r) => ['source' => $r->source, 'total' => (int) $r->total])
            ->all();
    }
}
