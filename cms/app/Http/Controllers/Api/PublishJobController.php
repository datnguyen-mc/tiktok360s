<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\PublishJob;
use App\Models\Run;
use App\Models\TiktokAccount;
use App\Services\TikTok\PublishService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PublishJobController extends Controller
{
    public function __construct(private PublishService $publisher) {}

    public function index(Request $request)
    {
        return response()->json(
            PublishJob::with(['run:id,run_date,title,thumbnail_path', 'account:id,display_name,avatar_url'])
                ->when($request->string('status')->toString(), fn ($q, $s) => $q->where('status', $s))
                ->latest('id')
                ->paginate(20)
        );
    }

    /** Tạo job đăng bài. Không truyền scheduled_at thì chạy ngay. */
    public function store(Request $request)
    {
        $data = $request->validate([
            'run_id'            => ['required', 'exists:runs,id'],
            'tiktok_account_id' => ['required', 'exists:tiktok_accounts,id'],
            'mode'              => ['required', Rule::in(['inbox', 'direct_post'])],
            'privacy_level'     => ['nullable', 'string', 'max:40'],
            'caption'           => ['nullable', 'string'],
            'scheduled_at'      => ['nullable', 'date'],
        ]);

        $run = Run::findOrFail($data['run_id']);
        abort_unless($run->has_video, 422, 'Lần chạy này chưa có file video.');

        $job = PublishJob::create([
            ...$data,
            'caption' => $data['caption'] ?? $run->caption,
            'status'  => 'queued',
        ]);

        ActivityLog::write('publish.queued',
            "Đưa video ngày {$run->run_date->format('d/m/Y')} vào hàng đợi đăng", 'info', $job);

        // Chỉ chạy ngay khi không hẹn giờ; job hẹn giờ do scheduler xử lý.
        if (empty($data['scheduled_at'])) {
            $job = $this->publisher->run($job);
        }

        return response()->json($job->load(['run', 'account']), 201);
    }

    /** Chạy lại một job đã thất bại. */
    public function retry(PublishJob $job)
    {
        abort_if(in_array($job->status, ['published'], true), 422, 'Job này đã đăng xong.');
        $job->update(['status' => 'queued', 'error_message' => null]);

        return response()->json($this->publisher->run($job));
    }

    /** Hỏi lại TikTok trạng thái xử lý. */
    public function sync(PublishJob $job)
    {
        return response()->json($this->publisher->syncStatus($job));
    }

    public function destroy(PublishJob $job)
    {
        abort_if($job->status === 'published', 422, 'Không xoá được job đã đăng.');
        $job->delete();

        return response()->json(['deleted' => true]);
    }

    /** Danh sách tài khoản để giao diện chọn khi đăng. */
    public function accounts()
    {
        return response()->json(TiktokAccount::orderByDesc('is_active')->latest('id')->get());
    }
}
