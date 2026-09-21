<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Run;
use App\Models\VideoEngine;
use App\Services\VideoEngineRunner;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Throwable;

/**
 * Bấm "Tạo lại" trên một video đã có.
 *
 * Khác "Tạo video mới" ở chỗ mọi thiết lập đều lấy sẵn từ lần chạy cũ — cùng
 * chủ đề, cùng ngày, cùng số tin, cùng giọng, cùng engine — nên không phải khai
 * lại gì. Đường nạp dữ liệu ghi đè theo (chủ đề + ngày), nên bản ghi cũ được
 * cập nhật chứ không sinh ra một dòng trùng.
 *
 * Ba cách tạo lại, chi phí giảm dần:
 *   mặc định     — lấy tin mới, dựng kịch bản mới (seed khác nên lời cũng khác)
 *   reuse_script — dùng lại output/<chủ đề>/<ngày>/script.json, chỉ đọc và ghép lại
 *   no_ai        — không sinh lại cảnh AI, quay về dùng ảnh báo (miễn phí)
 */
class RegenerateVideoController extends Controller
{
    public function __construct(private VideoEngineRunner $runner) {}

    public function __invoke(Request $request, Run $run)
    {
        $data = $request->validate([
            'reuse_script'    => ['nullable', 'boolean'],
            'no_ai'           => ['nullable', 'boolean'],
            'items'           => ['nullable', 'integer', 'min:1', 'max:30'],
            'voice'           => ['nullable', 'string', 'max:60'],
            'video_engine_id' => ['nullable', 'exists:video_engines,id'],
        ]);

        $engine = $this->pickEngine($data['video_engine_id'] ?? $run->video_engine_id);

        $options = array_filter([
            'topic' => $run->topic,
            'date'  => $run->run_date->format('Y-m-d'),
            'items' => $data['items'] ?? $run->items_count ?: null,
            'voice' => $data['voice'] ?? $run->voice_id,
            // Prompt của lần chạy cũ, để cảnh AI dựng lại cùng một kiểu hình.
            'prompt' => $engine->is_ai ? $run->prompt_template : null,
            'no_ai'  => ! empty($data['no_ai']) ?: null,
        ], fn ($v) => $v !== null && $v !== '');

        if (! empty($data['reuse_script'])) {
            $options['script'] = $this->scriptPath($run);
        } else {
            // Cùng một ngày thì seed mặc định giống nhau, kịch bản sẽ ra y như
            // cũ. Đổi seed để lần tạo lại thật sự khác lần trước.
            $options['seed'] = random_int(1, 999999);
        }

        try {
            $result = $this->runner->trigger($engine, $options);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        // Đánh dấu ngay để giao diện thấy video đang được dựng lại, không phải
        // chờ tới lúc dây chuyền nạp kết quả về mới đổi trạng thái.
        $run->update(['status' => 'running', 'error_message' => null]);

        ActivityLog::write('run.regenerated',
            "Tạo lại video {$run->topic_name} ngày {$run->run_date->format('d/m/Y')}",
            'info', $run, $options);

        return response()->json([
            ...$result,
            'run'      => $run->fresh(),
            'engine'   => $engine->only(['id', 'name', 'type', 'model', 'is_ai']),
            'estimate' => $engine->estimateCost((int) ($run->duration_sec ?: 105)),
        ]);
    }

    private function pickEngine(?int $id): VideoEngine
    {
        $engine = $id ? VideoEngine::find($id) : null;

        // Engine của lần chạy cũ có thể đã bị xoá hoặc tắt — lùi về engine mặc
        // định thay vì báo lỗi, vì người dùng chỉ muốn dựng lại cái video.
        if (! $engine || ! $engine->is_active) {
            $engine = VideoEngine::where('is_default', true)->where('is_active', true)->first()
                   ?? VideoEngine::where('is_active', true)->first();
        }

        if (! $engine) {
            throw ValidationException::withMessages([
                'video_engine_id' => 'Chưa có engine nào đang bật. Vào mục Engine tạo video để thêm.',
            ]);
        }

        return $engine;
    }

    /** output/<chủ đề>/<ngày>/script.json — phải có thật mới cho dùng lại. */
    private function scriptPath(Run $run): string
    {
        $path = sprintf('%s/output/%s/%s/script.json',
            rtrim((string) config('pipeline.root'), '/'),
            $run->topic, $run->run_date->format('Y-m-d'));

        if (! is_file($path)) {
            throw ValidationException::withMessages([
                'reuse_script' => 'Không còn file kịch bản của lần chạy này — bỏ chọn '
                                 .'“dùng lại kịch bản” để lấy tin mới.',
            ]);
        }

        return $path;
    }
}
