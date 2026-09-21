<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GenerationCall;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Lịch sử chi phí gọi API sinh cảnh.
 *
 * Trả về ba lớp, tương ứng ba câu hỏi thật:
 *   summary — tháng này đã tiêu bao nhiêu, trượt bao nhiêu lần gọi
 *   by_model — model nào đang ăn tiền nhất (để so trước/sau khi đổi model)
 *   by_day  — biểu đồ 30 ngày, thấy ngay ngày nào nhảy vọt
 *   calls   — từng lần gọi, có phân trang, lọc được theo provider/model/trạng thái
 */
class GenerationCostController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'provider' => ['nullable', 'string', 'max:30'],
            'model'    => ['nullable', 'string', 'max:80'],
            'status'   => ['nullable', 'in:success,failed'],
            'topic'    => ['nullable', 'string', 'max:40'],
            'from'     => ['nullable', 'date'],
            'to'       => ['nullable', 'date'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ]);

        $base = fn () => GenerationCall::query()
            ->when($filters['provider'] ?? null, fn ($q, $v) => $q->where('provider', $v))
            ->when($filters['model'] ?? null,    fn ($q, $v) => $q->where('model', $v))
            ->when($filters['status'] ?? null,   fn ($q, $v) => $q->where('status', $v))
            ->when($filters['topic'] ?? null,    fn ($q, $v) => $q->where('topic', $v))
            ->when($filters['from'] ?? null,     fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($filters['to'] ?? null,       fn ($q, $v) => $q->whereDate('created_at', '<=', $v));

        return response()->json([
            'summary'  => $this->summary(),
            'by_model' => $base()
                ->selectRaw('provider, model, COUNT(*) calls,
                             SUM(status = "failed") failed,
                             SUM(seconds) seconds,
                             SUM(cost_usd) cost')
                ->groupBy('provider', 'model')
                ->orderByDesc('cost')->get(),
            'by_day'   => $base()
                ->selectRaw('DATE(created_at) d, COUNT(*) calls,
                             SUM(status = "failed") failed, SUM(cost_usd) cost')
                ->where('created_at', '>=', now()->subDays(30))
                ->groupBy('d')->orderBy('d')->get(),
            'calls'    => $base()
                ->with(['run:id,title,topic,run_date', 'engine:id,name'])
                ->latest('id')
                ->paginate($filters['per_page'] ?? 25),
            // Để giao diện dựng danh sách lọc mà không phải đoán
            'providers' => GenerationCall::select('provider')->distinct()->pluck('provider'),
            'models'    => GenerationCall::select('model')->whereNotNull('model')
                                         ->distinct()->pluck('model'),
        ]);
    }

    /** Số tổng không phụ thuộc bộ lọc — luôn là toàn cảnh. */
    private function summary(): array
    {
        $row = GenerationCall::selectRaw('
            COUNT(*) calls,
            SUM(status = "failed") failed,
            SUM(cost_usd) cost_all,
            SUM(CASE WHEN created_at >= ? THEN cost_usd ELSE 0 END) cost_30d,
            SUM(CASE WHEN created_at >= ? THEN cost_usd ELSE 0 END) cost_today
        ', [now()->subDays(30), now()->startOfDay()])->first();

        $calls = (int) ($row->calls ?? 0);
        $failed = (int) ($row->failed ?? 0);

        return [
            'calls'        => $calls,
            'failed'       => $failed,
            // Tỉ lệ hỏng là con số đáng nhìn nhất: gọi hỏng không mất tiền nhưng
            // mất cảnh, video phải lùi về ảnh báo.
            'failed_rate'  => $calls ? round($failed * 100 / $calls, 1) : 0.0,
            'cost_all'     => round((float) ($row->cost_all ?? 0), 2),
            'cost_30d'     => round((float) ($row->cost_30d ?? 0), 2),
            'cost_today'   => round((float) ($row->cost_today ?? 0), 2),
            // Chiếu 30 ngày qua ra một tháng để ước chi phí chạy đều
            'projected_month' => round((float) ($row->cost_30d ?? 0), 2),
        ];
    }
}
