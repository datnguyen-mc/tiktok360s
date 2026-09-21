<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

    public function destroy(Run $run)
    {
        $run->delete();

        return response()->json(['deleted' => true]);
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
