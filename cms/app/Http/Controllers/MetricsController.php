<?php

namespace App\Http\Controllers;

use App\Models\PublishJob;
use App\Models\Run;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

/**
 * Số liệu cho Prometheus, định dạng văn bản chuẩn.
 *
 * Cố ý đo **việc của hệ thống này**, không phải CPU/RAM — thứ đó đã có
 * node-exporter lo. Câu hỏi cần trả lời là: hôm nay có ra video không, đăng có
 * trôi không, và đang tốn bao nhiêu tiền cho model AI.
 */
class MetricsController extends Controller
{
    public function __invoke(): Response
    {
        $lines = [];

        $add = function (string $name, string $help, string $type, array $samples) use (&$lines) {
            $lines[] = "# HELP {$name} {$help}";
            $lines[] = "# TYPE {$name} {$type}";
            foreach ($samples as $labels => $value) {
                $lines[] = $labels === '' ? "{$name} {$value}" : "{$name}{{$labels}} {$value}";
            }
        };

        // ── Số lần chạy theo trạng thái
        $byStatus = Run::select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')->pluck('total', 'status');
        $add('showbiz_runs_total', 'Tổng số lần chạy dây chuyền theo trạng thái', 'counter',
            $byStatus->mapWithKeys(fn ($v, $k) => ['status="'.$k.'"' => $v])->all());

        // ── Video mới nhất: thời điểm và thời lượng
        $last = Run::successful()->latest('run_date')->latest('id')->first();
        $add('showbiz_last_run_timestamp_seconds',
            'Thời điểm lần chạy thành công gần nhất (unix). Cảnh báo dựa trên số này.',
            'gauge', ['' => $last?->created_at?->timestamp ?? 0]);
        $add('showbiz_last_run_duration_seconds', 'Thời lượng video mới nhất', 'gauge',
            ['' => $last?->duration_sec ?? 0]);
        $add('showbiz_last_run_drift_seconds',
            'Sai lệch giữa thời lượng thật và ước lượng của mô hình', 'gauge',
            ['' => $last?->drift_sec ?? 0]);
        $add('showbiz_last_run_items', 'Số tin trong video mới nhất', 'gauge',
            ['' => $last?->items_count ?? 0]);

        // ── Hàng đợi đăng bài
        $jobs = PublishJob::select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')->pluck('total', 'status');
        $add('showbiz_publish_jobs_total', 'Số job đăng bài theo trạng thái', 'gauge',
            $jobs->mapWithKeys(fn ($v, $k) => ['status="'.$k.'"' => $v])->all());

        $failed24h = PublishJob::where('status', 'failed')
            ->where('updated_at', '>=', now()->subDay())->count();
        $add('showbiz_publish_failures_24h', 'Số job đăng bài thất bại trong 24 giờ qua',
            'gauge', ['' => $failed24h]);

        // ── Chi phí sinh cảnh bằng AI
        $costToday = (float) Run::whereDate('run_date', today())->sum('generation_cost_usd');
        $cost30d   = (float) Run::where('run_date', '>=', now()->subDays(30))->sum('generation_cost_usd');
        $add('showbiz_generation_cost_usd_today', 'Chi phí model AI hôm nay (USD)', 'gauge',
            ['' => round($costToday, 4)]);
        $add('showbiz_generation_cost_usd_30d', 'Chi phí model AI 30 ngày qua (USD)', 'gauge',
            ['' => round($cost30d, 4)]);

        // ── Kênh TikTok cần chú ý
        $expiring = \App\Models\TiktokAccount::where('is_active', true)
            ->whereNotNull('refresh_expires_at')
            ->where('refresh_expires_at', '<=', now()->addDays(14))->count();
        $add('showbiz_channels_token_expiring', 'Số kênh có refresh token sắp hết hạn (14 ngày)',
            'gauge', ['' => $expiring]);

        return response(implode("\n", $lines)."\n", 200, [
            'Content-Type' => 'text/plain; version=0.0.4; charset=utf-8',
        ]);
    }
}
