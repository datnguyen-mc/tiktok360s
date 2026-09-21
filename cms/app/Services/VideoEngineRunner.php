<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\VideoEngine;
use Illuminate\Support\Facades\Http;
use RuntimeException;
use Symfony\Component\Process\Exception\ProcessTimedOutException;
use Symfony\Component\Process\Process;
use Throwable;

/**
 * Kích hoạt việc tạo video, từ CMS.
 *
 *  local — chạy dây chuyền Python trên chính máy này. Chạy nền, vì render mất
 *          khoảng một phút, lâu hơn thời gian chờ hợp lý của một request web.
 *          Dữ liệu quay về CMS qua đường nạp `POST /api/ingest/run` như bình thường.
 *  http  — gọi sang dịch vụ dựng video riêng của bạn. CMS chỉ đưa yêu cầu; dịch
 *          vụ đó tự nạp kết quả về bằng cùng endpoint ingest.
 */
class VideoEngineRunner
{
    public function trigger(VideoEngine $engine, array $options = []): array
    {
        if (! $engine->is_active) {
            throw new RuntimeException('Engine đang tắt.');
        }

        try {
            $result = $engine->type === 'http'
                ? $this->callHttp($engine, $options)
                : $this->runLocal($engine, $options);

            $engine->update(['last_used_at' => now(), 'last_error' => null]);
            ActivityLog::write('engine.triggered',
                "Đã kích hoạt engine “{$engine->name}”", 'info', $engine, $options);

            return $result;
        } catch (Throwable $e) {
            $engine->update(['last_error' => mb_substr($e->getMessage(), 0, 2000)]);
            ActivityLog::write('engine.failed', $e->getMessage(), 'error', $engine, $options);
            throw $e;
        }
    }

    private function runLocal(VideoEngine $engine, array $options): array
    {
        $cwd = $engine->working_dir ?: config('pipeline.root');
        if (! is_dir($cwd)) {
            throw new RuntimeException("Không tìm thấy thư mục làm việc: {$cwd}");
        }

        $command = $engine->command ?: '.venv/bin/python -m pipeline.run_daily';
        $args = [];
        // Engine nào được chọn thì dây chuyền phải dùng đúng cái đó, không phải
        // engine mặc định — nếu không, chọn Veo mà lại chạy bằng ảnh báo.
        $args[] = '--engine '.(int) $engine->id;
        if (! empty($options['topic'])) { $args[] = '--topic '.escapeshellarg($options['topic']); }
        if (! empty($options['date']))  { $args[] = '--date '.escapeshellarg($options['date']); }
        if (! empty($options['items'])) { $args[] = '--items '.(int) $options['items']; }
        if (! empty($options['voice'])) { $args[] = '--voice '.escapeshellarg($options['voice']); }
        // escapeshellarg lo phần dấu nháy và ký tự lạ trong prompt
        if (! empty($options['prompt'])) {
            $args[] = '--prompt '.escapeshellarg($options['prompt']);
        }
        if (! empty($options['negative_prompt'])) {
            $args[] = '--negative-prompt '.escapeshellarg($options['negative_prompt']);
        }
        // Tạo lại: seed khác thì câu mở đầu và câu cảm thán đổi, nếu không thì
        // cùng một ngày sẽ ra đúng một kịch bản như cũ (seed mặc định = số thứ
        // tự của ngày). Kèm theo là hai đường tắt để tạo lại cho rẻ.
        if (! empty($options['seed']))   { $args[] = '--seed '.(int) $options['seed']; }
        if (! empty($options['script'])) { $args[] = '--script '.escapeshellarg($options['script']); }
        if (! empty($options['no_ai']))  { $args[] = '--no-ai'; }

        $full = trim($command.' '.implode(' ', $args));

        // Chạy nền: render mất khoảng một phút nên không giữ request lại chờ.
        $process = Process::fromShellCommandline($full.' >> logs/cms-trigger.log 2>&1 &', $cwd);
        $process->setTimeout(10);

        try {
            $process->run();
        } catch (ProcessTimedOutException) {
            // Chạy nền nên hết giờ chờ ở đây là bình thường.
        }

        return ['mode' => 'local', 'command' => $full,
                'message' => 'Đã chạy nền — dữ liệu sẽ tự xuất hiện khi render xong.'];
    }

    private function callHttp(VideoEngine $engine, array $options): array
    {
        if (! filled($engine->endpoint)) {
            throw new RuntimeException('Engine chưa có endpoint.');
        }

        $payload = array_merge($engine->payload_template ?? [], $options, [
            // Địa chỉ để dịch vụ ngoài nạp kết quả ngược về CMS
            'callback_url'   => url('/api/ingest/run'),
            'callback_token' => config('pipeline.ingest_token'),
        ]);

        $request = Http::timeout(60)->acceptJson();
        if (filled($engine->api_key)) {
            $request = $request->withHeaders([
                $engine->auth_header => trim($engine->auth_prefix.' '.$engine->api_key),
            ]);
        }

        $response = $request->post($engine->endpoint, $payload);

        if (! $response->successful()) {
            throw new RuntimeException(
                "Engine trả về HTTP {$response->status()}: ".mb_substr($response->body(), 0, 300)
            );
        }

        return ['mode' => 'http', 'response' => $response->json() ?? []];
    }
}
