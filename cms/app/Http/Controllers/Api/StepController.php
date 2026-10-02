<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Run;
use App\Models\PipelineJob;
use App\Models\RunStep;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Nhận báo cáo từng bước từ dây chuyền Python.
 *
 * Bước được gửi lên ngay khi xong, nên lần chạy phải tồn tại trước — dây chuyền
 * tạo bản ghi `running` ngay từ đầu rồi mới bắt đầu làm việc.
 */
class StepController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'topic'       => ['required', 'string', 'max:40'],
            'run_date'    => ['required', 'date'],
            'episode'     => ['nullable', 'integer', 'min:0', 'max:65000'],
            'sequence'    => ['required', 'integer', 'min:0', 'max:255'],
            'step'        => ['required', 'string', 'max:40'],
            'label'       => ['required', 'string', 'max:255'],
            'status'      => ['required', Rule::in(['running', 'done', 'failed'])],
            'duration_ms' => ['nullable', 'integer', 'min:0'],
            'detail'      => ['nullable', 'string'],
            'meta'        => ['nullable', 'array'],
            'started_at'  => ['nullable', 'date'],
            'finished_at' => ['nullable', 'date'],
        ]);

        // Lần chạy chưa có thì tạo khung trống — bước đầu tiên thường tới trước
        // khi có đủ dữ liệu để ghi bản ghi đầy đủ.
        $run = Run::firstOrCreate(
            ['topic'    => $data['topic'],
             'run_date' => $data['run_date'],
             'episode'  => $data['episode'] ?? 0],
            ['status' => 'running', 'topic_name' => ucfirst($data['topic'])]
        );

        /*
         * Bước đầu tiên báo về = một lượt chạy MỚI bắt đầu. Xoá hết bước cũ.
         *
         * Không xoá thì lượt chạy hỏng sớm sẽ để lại các bước sau của lần trước:
         * nhìn vào thấy "thu thập tin: hỏng" mà bên dưới "dựng kịch bản: đang
         * chạy" — hai dòng mâu thuẫn nhau, và cái đang chạy thì chạy mãi không
         * bao giờ xong.
         */
        if ($data['sequence'] <= 1 && $data['status'] === 'running') {
            RunStep::where('run_id', $run->id)->delete();
            $run->update(['status' => 'running', 'error_message' => null]);
        }

        /*
         * Nối lượt chạy với tiến trình đã sinh ra nó.
         *
         * Tiến trình được ghi lại lúc bấm nút, còn lượt chạy chỉ ra đời khi bước
         * đầu tiên báo về — vài giây sau. Không nối lại ở đây thì bấm Dừng sẽ
         * giết được tiến trình nhưng lượt chạy nằm mãi ở "đang chạy", và bảng
         * điều khiển trông như có một video sắp xong.
         */
        PipelineJob::whereNull('run_id')
            ->where('status', 'running')
            ->where(fn ($q) => $q->where('topic', $data['topic'])->orWhereNull('topic'))
            ->whereDate('run_date', $data['run_date'])
            ->latest('id')->limit(1)
            ->update(['run_id' => $run->id, 'topic' => $data['topic']]);

        $step = RunStep::updateOrCreate(
            ['run_id' => $run->id, 'step' => $data['step']],
            collect($data)->except(['topic', 'run_date', 'episode'])->all()
        );

        /*
         * Dựng kịch bản xong thì ghi một dòng vào nhật ký, nói rõ bước này có gọi
         * AI hay không và lời lấy từ đâu. Middleware bỏ qua đường dẫn này vì quá
         * ồn, nên không ghi ở đây thì nhật ký không có dấu vết gì của bước này.
         */
        if ($data['step'] === 'script' && $data['status'] === 'done') {
            $meta = $data['meta'] ?? [];
            $tap = ! empty($data['episode']) ? " · tập {$data['episode']}" : '';
            $nguon = match ($meta['nguon'] ?? null) {
                'gemini' => 'lời cảnh do Gemini viết ở bước trước',
                'rss'    => 'lời lấy từ tin RSS',
                default  => 'không rõ nguồn lời',
            };
            $style = $meta['style'] ?? '?';
            $detail = $data['detail'] ?? '';

            ActivityLog::write(
                'pipeline.script',
                "Dựng kịch bản {$run->topic_name}{$tap}: {$detail} — {$nguon}, "
                    ."bước này chỉ ghép mẫu câu “{$style}”",
                'info',
                $run,
                $meta + ['duration_ms' => $data['duration_ms'] ?? null]
            );
        }

        return response()->json(['id' => $step->id, 'run_id' => $run->id], 201);
    }
}
