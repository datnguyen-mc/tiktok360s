<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\PipelineJob;
use App\Models\VideoEngine;
use App\Services\VideoEngineRunner;
use Illuminate\Http\Request;
use Throwable;

/** Dừng và chạy tiếp các lượt dựng video. */
class PipelineJobController extends Controller
{
    public function __construct(private VideoEngineRunner $runner) {}

    public function index(Request $request)
    {
        $jobs = PipelineJob::with(['run:id,topic,run_date,episode,title,status', 'engine:id,name',
                                   'user:id,name'])
            ->latest('id')->limit(30)->get();

        // Tiến trình có thể đã chết mà bảng chưa biết — máy chủ khởi động lại,
        // hoặc tiến trình bị giết từ dòng lệnh. Đối chiếu lại trước khi trả về,
        // nếu không nút Dừng sẽ hiện mãi cho một thứ không còn tồn tại.
        foreach ($jobs->where('status', 'running') as $job) {
            if (! $job->alive()) {
                $job->update(['status' => 'done', 'finished_at' => now(),
                              'note' => 'Tiến trình đã kết thúc']);
            }
        }

        return response()->json([
            'jobs'    => $jobs->fresh(['run', 'engine', 'user']),
            'running' => PipelineJob::dangChay()->count(),
        ]);
    }

    public function stop(PipelineJob $job)
    {
        if ($job->status !== 'running') {
            return response()->json(['message' => 'Lượt này không còn chạy.'], 422);
        }

        $job->stop();

        // Lượt chạy dở dang phải đổi trạng thái, nếu không nó nằm mãi ở "đang
        // chạy" và bảng điều khiển trông như có một video sắp xong.
        $job->run?->update(['status' => 'failed',
                            'error_message' => 'Bị dừng bằng tay từ CMS']);

        ActivityLog::write('pipeline.stopped',
            "Dừng lượt dựng video #{$job->id}".($job->topic ? " ({$job->topic})" : ''),
            'warning', $job, ['pid' => $job->pid, 'command' => $job->command]);

        return response()->json(['message' => 'Đã dừng.', 'job' => $job->fresh()]);
    }

    /**
     * Chạy tiếp một lượt đã dừng.
     *
     * Nếu kịch bản đã dựng xong thì dùng lại bằng `--script`: bỏ qua khâu lấy
     * tin và khâu gọi AI viết kịch bản — hai khâu tốn tiền và tốn thời gian
     * nhất. Chưa có kịch bản thì chạy lại từ đầu.
     */
    public function resume(PipelineJob $job)
    {
        if ($job->status === 'running') {
            return response()->json(['message' => 'Lượt này đang chạy.'], 422);
        }

        $engine = $job->engine ?: VideoEngine::where('is_active', true)->first();
        if (! $engine) {
            return response()->json(['message' => 'Không còn engine nào đang bật.'], 422);
        }

        $options = array_filter([
            'topic' => $job->topic,
            'date'  => $job->run_date?->toDateString(),
        ]);

        if ($script = $this->scriptCu($job)) {
            $options['script'] = $script;
        }

        try {
            $result = $this->runner->trigger($engine, $options);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        ActivityLog::write('pipeline.resumed',
            "Chạy tiếp lượt dựng video #{$job->id}".($job->topic ? " ({$job->topic})" : ''),
            'info', $job, ['dung_lai_kich_ban' => (bool) $script]);

        return response()->json([
            ...$result,
            'message' => $script
                ? 'Chạy tiếp từ kịch bản đã dựng — bỏ qua khâu lấy tin và gọi AI.'
                : 'Chưa có kịch bản cũ nên chạy lại từ đầu.',
        ]);
    }

    /** Đường dẫn script.json của lượt trước, nếu còn. */
    private function scriptCu(PipelineJob $job): ?string
    {
        if (! $job->topic || ! $job->run_date) {
            return null;
        }

        $goc = rtrim((string) config('pipeline.root'), '/');
        $ngay = $job->run_date->toDateString();
        $ep = $job->run?->episode;

        foreach (array_filter([
            $ep ? sprintf('%s/output/%s/%s/tap-%02d/script.json', $goc, $job->topic, $ngay, $ep) : null,
            sprintf('%s/output/%s/%s/script.json', $goc, $job->topic, $ngay),
        ]) as $duong) {
            if (is_file($duong)) {
                return $duong;
            }
        }

        return null;
    }
}
