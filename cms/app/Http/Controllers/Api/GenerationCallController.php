<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\GenerationCall;
use App\Models\Run;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Nhận nhật ký từng lần gọi API sinh cảnh, NGAY khi clip xong hoặc hỏng.
 *
 * Vì sao không đợi cuối lượt chạy như phần còn lại: dây chuyền chết giữa chừng
 * thì bản ghi cuối lượt không bao giờ được gửi — mà đó lại đúng là lần chạy cần
 * soi nhất. Gửi ngay thì dù tiến trình bị giết, vẫn còn dấu vết đã gọi những gì.
 */
class GenerationCallController extends Controller
{
    public function __invoke(Request $request)
    {
        $data = $request->validate([
            'topic'           => ['nullable', 'string', 'max:40'],
            'run_date'        => ['nullable', 'date'],
            'video_engine_id' => ['nullable', 'integer'],
            'provider'        => ['required', 'string', 'max:30'],
            'model'           => ['nullable', 'string', 'max:80'],
            'resolution'      => ['nullable', 'string', 'max:20'],
            'scene_index'     => ['nullable', 'integer', 'min:0'],
            'prompt'          => ['nullable', 'string'],
            'seconds'         => ['nullable', 'integer', 'min:0'],
            'cost_per_second' => ['nullable', 'numeric', 'min:0'],
            'cost_usd'        => ['nullable', 'numeric', 'min:0'],
            'status'          => ['required', Rule::in(['success', 'failed'])],
            'error_message'   => ['nullable', 'string'],
            'clip_url'        => ['nullable', 'string', 'max:1000'],
            'http_status'     => ['nullable', 'integer', 'min:0', 'max:599'],
            'duration_ms'     => ['nullable', 'integer', 'min:0'],
            'requests'        => ['nullable', 'integer', 'min:0'],
        ]);

        // Lượt chạy có thể chưa được nạp (nó chỉ nạp ở cuối), nên bản ghi này
        // sống độc lập: run_id để trống cũng không sao, topic/run_date đủ để
        // ghép lại về sau.
        $run = null;
        if (! empty($data['topic']) && ! empty($data['run_date'])) {
            $run = Run::where('topic', $data['topic'])
                ->whereDate('run_date', $data['run_date'])->first();
        }

        $call = GenerationCall::create([
            ...collect($data)->except(['topic', 'run_date'])->all(),
            'run_id'    => $run?->id,
            'topic'     => $data['topic'] ?? null,
            'run_date'  => $data['run_date'] ?? null,
            'run_title' => $run?->title,
            'cost_usd'  => $data['cost_usd'] ?? 0,
        ]);

        // Lần gọi hỏng phải nổi lên nhật ký hoạt động, không nằm im trong bảng
        // chi phí — tiền không mất nhưng video thiếu cảnh.
        if ($call->status === 'failed') {
            ActivityLog::write(
                'generation.failed',
                sprintf('%s/%s hỏng ở cảnh %s%s',
                    $call->provider, $call->model ?? '?', $call->scene_index ?? '?',
                    $call->http_status ? " (HTTP {$call->http_status})" : ''),
                'error',
                $run,
                ['error' => mb_substr((string) $call->error_message, 0, 500),
                 'duration_ms' => $call->duration_ms, 'requests' => $call->requests]
            );
        }

        return response()->json(['id' => $call->id], 201);
    }
}
