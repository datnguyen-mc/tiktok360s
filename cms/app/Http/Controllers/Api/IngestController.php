<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\GenerationCall;
use App\Models\PublishJob;
use App\Models\Run;
use App\Models\TiktokAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Điểm nạp dữ liệu cho script Python. Xác thực bằng khoá tĩnh trong header
 * `X-Ingest-Token` chứ không dùng phiên đăng nhập, vì script chạy nền không có
 * trình duyệt. Khoá nằm ở INGEST_TOKEN trong .env.
 */
class IngestController extends Controller
{
    /**
     * Kênh nào bật "tự đăng" thì video mới vào là tạo luôn job cho kênh đó.
     * Job chỉ được xếp hàng, không chạy ngay: việc chạy do scheduler đảm nhiệm,
     * vì nạp dữ liệu là request của script nền, không nên kéo dài thêm một phút
     * tải video lên TikTok.
     */
    private function queueAutoPublish(Run $run): void
    {
        $channels = TiktokAccount::where('is_active', true)->where('auto_publish', true)->get();

        foreach ($channels as $channel) {
            $exists = PublishJob::where('run_id', $run->id)
                ->where('tiktok_account_id', $channel->id)
                ->whereNotIn('status', ['failed', 'cancelled'])
                ->exists();
            if ($exists) {
                continue;
            }

            $caption = trim(($run->caption ?? '')."\n".($channel->caption_suffix ?? ''));
            $when = $channel->publish_time
                ? now()->setTimeFromTimeString($channel->publish_time)
                : now();
            if ($when->isPast()) {
                $when = now();
            }

            PublishJob::create([
                'run_id'            => $run->id,
                'tiktok_account_id' => $channel->id,
                'status'            => 'queued',
                'mode'              => $channel->default_mode,
                'privacy_level'     => $channel->default_privacy,
                'caption'           => $caption,
                'scheduled_at'      => $when,
            ]);

            ActivityLog::write('publish.auto_queued',
                "Tự xếp hàng đăng lên kênh ".($channel->nickname ?: $channel->display_name),
                'info', $run);
        }
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'topic'         => ['nullable', 'string', 'max:40'],
            'topic_name'    => ['nullable', 'string', 'max:80'],
            'run_date'      => ['required', 'date'],
            'status'        => ['required', Rule::in(['running', 'success', 'failed'])],
            'title'         => ['nullable', 'string', 'max:255'],
            'style'         => ['nullable', 'string', 'max:30'],
            'voice_id'      => ['nullable', 'string', 'max:60'],
            'voice_rate'    => ['nullable', 'string', 'max:10'],
            'items_count'   => ['nullable', 'integer', 'min:0'],
            'scenes_count'  => ['nullable', 'integer', 'min:0'],
            'syllables'     => ['nullable', 'integer', 'min:0'],
            'duration_sec'  => ['nullable', 'numeric'],
            'estimated_sec' => ['nullable', 'numeric'],
            'tts_attempts'  => ['nullable', 'integer', 'min:0', 'max:255'],
            'video_path'    => ['nullable', 'string', 'max:500'],
            'video_bytes'   => ['nullable', 'integer', 'min:0'],
            'thumbnail_path'=> ['nullable', 'string', 'max:500'],
            'video_url'     => ['nullable', 'url', 'max:700'],
            'thumbnail_url' => ['nullable', 'url', 'max:700'],
            'caption'       => ['nullable', 'string'],
            'clip_provider' => ['nullable', 'string', 'max:20'],
            'prompt_template' => ['nullable', 'string'],
            'generation_cost_usd' => ['nullable', 'numeric', 'min:0'],
            'started_at'    => ['nullable', 'date'],
            'finished_at'   => ['nullable', 'date'],
            'error_message' => ['nullable', 'string'],

            'items'                => ['array'],
            'items.*.position'     => ['required', 'integer', 'min:1'],
            'items.*.headline'     => ['required', 'string', 'max:500'],
            'items.*.source'       => ['nullable', 'string', 'max:80'],
            'items.*.url'          => ['nullable', 'string', 'max:1000'],
            'items.*.image_url'    => ['nullable', 'string', 'max:1000'],
            'items.*.score'        => ['nullable', 'numeric'],
            'items.*.topic'        => ['nullable', 'string', 'max:30'],
            'items.*.reaction'     => ['nullable', 'string', 'max:200'],
            'items.*.vo'           => ['nullable', 'string'],
            'items.*.clip_prompt'  => ['nullable', 'string'],
            'items.*.clip_url'     => ['nullable', 'string', 'max:1000'],
            'items.*.clip_cost_usd' => ['nullable', 'numeric', 'min:0'],
            'items.*.scene_start'  => ['nullable', 'numeric'],
            'items.*.scene_dur'    => ['nullable', 'numeric'],

            // Nhật ký từng lần gọi API sinh cảnh, kèm cả lần thất bại
            'clip_calls'                    => ['nullable', 'array'],
            'clip_calls.*.video_engine_id'  => ['nullable', 'integer'],
            'clip_calls.*.provider'         => ['required_with:clip_calls', 'string', 'max:30'],
            'clip_calls.*.model'            => ['nullable', 'string', 'max:80'],
            'clip_calls.*.resolution'       => ['nullable', 'string', 'max:20'],
            'clip_calls.*.scene_index'      => ['nullable', 'integer', 'min:0'],
            'clip_calls.*.prompt'           => ['nullable', 'string'],
            'clip_calls.*.seconds'          => ['nullable', 'integer', 'min:0'],
            'clip_calls.*.cost_per_second'  => ['nullable', 'numeric', 'min:0'],
            'clip_calls.*.cost_usd'         => ['nullable', 'numeric', 'min:0'],
            'clip_calls.*.status'           => ['nullable', Rule::in(['success', 'failed'])],
            'clip_calls.*.error_message'    => ['nullable', 'string'],
            'clip_calls.*.clip_url'         => ['nullable', 'string', 'max:1000'],
        ]);

        $items = $data['items'] ?? [];
        $calls = $data['clip_calls'] ?? [];
        unset($data['items'], $data['clip_calls']);

        // Kịch bản cũ (trước khi có chủ đề) gửi topic = null. Để nguyên thì câu
        // UPDATE sẽ ghi đè cột thành null và vi phạm ràng buộc NOT NULL.
        $data['topic'] = $data['topic'] ?: 'showbiz';
        $data['topic_name'] = $data['topic_name'] ?: ucfirst($data['topic']);

        $run = DB::transaction(function () use ($data, $items, $calls) {
            // Chạy lại cùng chủ đề + cùng ngày thì ghi đè, không tạo bản trùng.
            // Phải có cả `topic`: hai chủ đề chạy cùng ngày là hai video khác nhau.
            $run = Run::updateOrCreate(
                ['topic' => $data['topic'], 'run_date' => $data['run_date']],
                $data
            );
            $run->items()->delete();
            if ($items) {
                $run->items()->createMany($items);
            }

            /*
             * Nhật ký chi phí thì GHI THÊM, không xoá bản cũ như items.
             *
             * Tạo lại một video là gọi API lần nữa và tốn tiền lần nữa; xoá lượt
             * gọi cũ đi thì tổng chi phí tháng sẽ thiếu đúng phần đã tiêu. Đây là
             * chỗ duy nhất trong hàm này cố tình không ghi đè.
             */
            foreach ($calls as $call) {
                GenerationCall::create(array_merge($call, [
                    'run_id'    => $run->id,
                    'topic'     => $run->topic,
                    'run_date'  => $run->run_date,
                    'run_title' => $run->title,
                    'status'    => $call['status'] ?? 'success',
                    'cost_usd'  => $call['cost_usd'] ?? 0,
                ]));
            }

            return $run;
        });

        ActivityLog::write(
            'run.ingested',
            "Nạp dữ liệu video ngày {$run->run_date->format('d/m/Y')} ({$run->items_count} tin)",
            $run->status === 'failed' ? 'error' : 'info',
            $run,
            ['duration_sec' => $run->duration_sec]
        );

        if ($run->status === 'success') {
            $this->queueAutoPublish($run);
        }

        return response()->json($run->load('items'), 201);
    }
}
