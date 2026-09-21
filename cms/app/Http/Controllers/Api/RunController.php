<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Run;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RunController extends Controller
{
    public function index(Request $request)
    {
        $runs = Run::query()
            ->when($request->string('topic')->toString(), fn ($q, $t) => $q->where('topic', $t))
            ->when($request->string('status')->toString(), fn ($q, $s) => $q->where('status', $s))
            ->when($request->string('q')->toString(), fn ($q, $term) => $q->where(
                fn ($w) => $w->where('title', 'like', "%{$term}%")
                             ->orWhere('caption', 'like', "%{$term}%")
            ))
            ->when($request->date('from'), fn ($q, $d) => $q->where('run_date', '>=', $d))
            ->when($request->date('to'), fn ($q, $d) => $q->where('run_date', '<=', $d))
            ->withCount('items')
            ->with('publishJobs:id,run_id,status,published_at')
            ->latest('run_date')->latest('id')
            ->paginate(20);

        return response()->json($runs);
    }

    public function show(Run $run)
    {
        return response()->json(
            $run->load(['steps', 'items', 'publishJobs.account:id,display_name,avatar_url'])
        );
    }

    /**
     * Xoá một lần chạy.
     *
     * Bản ghi con (tin, bước, job đăng bài) tự xoá theo nhờ cascadeOnDelete.
     * File video thì KHÔNG: mỗi video 15–20 MB, xoá bản ghi mà để file lại là
     * dọn nửa vời, nên có `delete_files`. Mặc định tắt vì xoá file không lấy lại được.
     *
     * Video đã đăng lên TikTok cần `force`: xoá bản ghi là mất dấu bài đang
     * sống trên TikTok (link, publish_id), mà bài đó thì vẫn còn nguyên.
     */
    public function destroy(Request $request, Run $run)
    {
        $data = $request->validate([
            'delete_files' => ['nullable', 'boolean'],
            'force'        => ['nullable', 'boolean'],
        ]);

        $published = $run->publishJobs()->where('status', 'published')->exists();
        if ($published && empty($data['force'])) {
            return response()->json([
                'message'     => 'Video này đã đăng lên TikTok. Xoá bản ghi ở đây sẽ mất dấu '
                                .'bài đó, còn bài trên TikTok thì vẫn còn.',
                'needs_force' => true,
            ], 409);
        }

        $removed = [];
        if (! empty($data['delete_files'])) {
            foreach ([$run->absoluteVideoPath(), $run->absoluteThumbnailPath()] as $path) {
                if ($path && is_file($path) && @unlink($path)) {
                    $removed[] = basename($path);
                }
            }
        }

        // Ghi nhật ký TRƯỚC khi xoá, và không gắn subject: gắn vào bản ghi vừa
        // xoá thì nhật ký trỏ tới một id không còn tồn tại.
        ActivityLog::write('run.deleted',
            sprintf('Xoá video %s ngày %s%s',
                $run->topic_name ?: $run->topic,
                $run->run_date->format('d/m/Y'),
                $removed ? ' (kèm '.count($removed).' file)' : ''),
            'warning', null, [
                'run_id'        => $run->id,
                'topic'         => $run->topic,
                'run_date'      => $run->run_date->format('Y-m-d'),
                'title'         => $run->title,
                'files_removed' => $removed,
                'r2_url'        => $run->video_url,
                'was_published' => $published,
            ]);

        // Bản trên R2 không xoá được từ đây: ổ đĩa s3 của Laravel cần
        // league/flysystem-aws-s3-v3, mà dự án chưa cài. Trả cờ về để giao diện
        // nói rõ với người dùng thay vì im lặng để lại file mồ côi.
        $r2Kept = (bool) $run->video_url;

        $run->delete();

        return response()->json([
            'deleted'       => true,
            'files_removed' => $removed,
            'r2_kept'       => $r2Kept,
        ]);
    }

    /**
     * Phát video. Ưu tiên file ngay trên máy chạy dây chuyền — nhanh hơn và
     * không tốn băng thông R2. File không còn (CMS chạy máy khác, hoặc output/
     * đã dọn) thì chuyển hướng sang bản trên R2.
     */
    public function video(Run $run): BinaryFileResponse|StreamedResponse|RedirectResponse
    {
        if ($run->hasLocalVideo()) {
            return response()->file($run->absoluteVideoPath(), [
                'Content-Type'  => 'video/mp4',
                'Accept-Ranges' => 'bytes',
            ]);
        }

        abort_unless((bool) $run->video_url, 404, 'Không tìm thấy file video');

        return redirect()->away($run->video_url);
    }

    public function thumbnail(Run $run): BinaryFileResponse|RedirectResponse
    {
        if ($run->hasLocalThumbnail()) {
            return response()->file($run->absoluteThumbnailPath(), ['Content-Type' => 'image/jpeg']);
        }

        abort_unless((bool) $run->thumbnail_url, 404);

        return redirect()->away($run->thumbnail_url);
    }
}
