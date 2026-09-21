<?php

namespace App\Services\TikTok;

use App\Models\ActivityLog;
use App\Models\PublishJob;
use App\Models\TiktokAccount;
use RuntimeException;
use Throwable;

/** Điều phối một lần đăng video: khởi tạo → tải lên → theo dõi trạng thái. */
class PublishService
{
    public function __construct(private TikTokClient $client) {}

    /**
     * Chạy một job đã ở trạng thái chờ. Hàm này tự bắt lỗi và ghi vào job,
     * để giao diện luôn có lý do thất bại cụ thể thay vì một cú sập trắng.
     */
    public function run(PublishJob $job): PublishJob
    {
        try {
            $this->attempt($job);
        } catch (Throwable $e) {
            $job->markFailed($e->getMessage());
            ActivityLog::write('publish.failed', $e->getMessage(), 'error', $job, [
                'run_id' => $job->run_id,
            ]);
        }

        return $job->fresh(['run', 'account']);
    }

    private function attempt(PublishJob $job): void
    {
        $account = $job->account;
        if (! $account || ! $account->is_active) {
            throw new RuntimeException('Job chưa gắn tài khoản TikTok đang hoạt động.');
        }

        $run = $job->run;
        // TikTok cần nguyên file để tải lên, không nhận URL. Còn file trên máy
        // thì dùng thẳng; chỉ khi mất mới kéo bản trên R2 về thư mục tạm.
        $temp = null;
        $path = $run->hasLocalVideo() ? $run->absoluteVideoPath() : null;
        if (! $path) {
            $path = $temp = $this->fetchFromR2($run);
        }

        $job->update([
            'status'     => 'uploading',
            'started_at' => now(),
            'attempts'   => $job->attempts + 1,
        ]);

        $token = $this->client->freshToken($account);
        $size  = filesize($path);

        $payload = [
            'source_info' => [
                'source'            => 'FILE_UPLOAD',
                'video_size'        => $size,
                'chunk_size'        => $size,
                'total_chunk_count' => 1,
            ],
        ];

        if ($job->mode === 'direct_post') {
            // TikTok bắt buộc hỏi creator_info trước khi đăng thẳng, và chỉ chấp
            // nhận mức riêng tư nằm trong danh sách mà chính nó vừa trả về.
            $info = $this->client->creatorInfo($token);
            $account->update(['creator_info' => $info, 'creator_info_at' => now()]);

            $allowed = $info['privacy_level_options'] ?? [];
            $privacy = $job->privacy_level;
            if (! $privacy || ! in_array($privacy, $allowed, true)) {
                $privacy = in_array('SELF_ONLY', $allowed, true)
                    ? 'SELF_ONLY'
                    : ($allowed[0] ?? 'SELF_ONLY');
            }

            $payload['post_info'] = [
                'title'                    => mb_substr((string) $job->caption, 0, 2200),
                'privacy_level'            => $privacy,
                'disable_duet'             => (bool) ($info['duet_disabled'] ?? false),
                'disable_comment'          => (bool) ($info['comment_disabled'] ?? false),
                'disable_stitch'           => (bool) ($info['stitch_disabled'] ?? false),
                'video_cover_timestamp_ms' => 1500,
            ];
            $job->update(['privacy_level' => $privacy]);
        }

        $init = $this->client->initUpload($token, $payload, $job->mode);

        $publishId = $init['publish_id'] ?? null;
        $uploadUrl = $init['upload_url'] ?? null;
        if (! $publishId || ! $uploadUrl) {
            throw new RuntimeException('TikTok không trả về publish_id/upload_url.');
        }

        $job->update(['publish_id' => $publishId, 'last_response' => $init]);
        try {
            $this->client->uploadFile($uploadUrl, $path);
        } finally {
            if ($temp && is_file($temp)) {
                @unlink($temp);
            }
        }

        $job->update(['status' => 'processing']);
        ActivityLog::write('publish.uploaded',
            "Đã tải video ngày {$run->run_date->format('d/m/Y')} lên TikTok", 'info', $job);

        $this->syncStatus($job);
    }

    /**
     * Kéo video từ R2 về một file tạm. Dùng khi CMS không chạy cùng máy với
     * dây chuyền, nên output/ không có ở đây.
     */
    private function fetchFromR2($run): string
    {
        if (! $run->video_url) {
            throw new RuntimeException(
                "Không tìm thấy file video ({$run->video_path}) và chưa có bản trên R2.");
        }

        $temp = tempnam(sys_get_temp_dir(), 'tiktok_').'.mp4';
        $in   = @fopen($run->video_url, 'rb');
        if (! $in) {
            throw new RuntimeException("Không tải được video từ R2: {$run->video_url}");
        }

        $out = fopen($temp, 'wb');
        stream_copy_to_stream($in, $out);
        fclose($in);
        fclose($out);

        if (filesize($temp) < 10000) {
            @unlink($temp);
            throw new RuntimeException("Bản tải từ R2 quá nhỏ, coi như hỏng: {$run->video_url}");
        }

        return $temp;
    }

    /**
     * Hỏi lại TikTok về trạng thái xử lý. Gọi được nhiều lần — giao diện dùng
     * hàm này cho nút "kiểm tra lại".
     */
    public function syncStatus(PublishJob $job): PublishJob
    {
        if (! $job->publish_id || ! $job->account) {
            return $job;
        }

        try {
            $token  = $this->client->freshToken($job->account);
            $status = $this->client->publishStatus($token, $job->publish_id);
        } catch (Throwable $e) {
            $job->markFailed($e->getMessage());

            return $job->fresh();
        }

        $state   = $status['status'] ?? 'PROCESSING_UPLOAD';
        $postIds = $status['publicaly_available_post_id'] ?? ($status['public_post_id'] ?? []);

        $update = ['last_response' => $status];

        if ($state === 'PUBLISH_COMPLETE') {
            $update['status']       = 'published';
            $update['published_at'] = now();
            if (! empty($postIds)) {
                $update['post_id']   = (string) $postIds[0];
                $update['share_url'] = 'https://www.tiktok.com/@'
                    .($job->account->display_name ?: 'me')."/video/{$postIds[0]}";
            }
            ActivityLog::write('publish.completed', 'TikTok đã đăng xong video', 'info', $job);
        } elseif ($state === 'FAILED') {
            $update['status']        = 'failed';
            $update['error_message'] = $status['fail_reason'] ?? 'TikTok báo xử lý thất bại';
            ActivityLog::write('publish.failed', $update['error_message'], 'error', $job);
        } elseif ($job->mode === 'inbox' && $state === 'SEND_TO_USER_INBOX') {
            // Chế độ nháp: TikTok đã đẩy vào app, người dùng tự bấm đăng.
            $update['status']       = 'published';
            $update['published_at'] = now();
            ActivityLog::write('publish.inbox',
                'Video đã vào mục nháp trong app TikTok — mở app để hoàn tất', 'info', $job);
        } else {
            $update['status'] = 'processing';
        }

        $job->update($update);

        return $job->fresh(['run', 'account']);
    }
}
