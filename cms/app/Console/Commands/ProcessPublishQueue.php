<?php

namespace App\Console\Commands;

use App\Models\PublishJob;
use App\Services\TikTok\PublishService;
use Illuminate\Console\Command;

/**
 * Chạy các job đăng bài đã tới giờ, và hỏi lại trạng thái những job TikTok
 * đang xử lý. Gọi mỗi phút bởi scheduler.
 */
class ProcessPublishQueue extends Command
{
    protected $signature = 'publish:process {--limit=5 : Số job xử lý mỗi lượt}';

    protected $description = 'Xử lý hàng đợi đăng bài TikTok';

    public function handle(PublishService $publisher): int
    {
        $limit = (int) $this->option('limit');

        $due = PublishJob::where('status', 'queued')
            ->where(fn ($q) => $q->whereNull('scheduled_at')->orWhere('scheduled_at', '<=', now()))
            ->orderBy('scheduled_at')
            ->limit($limit)
            ->get();

        foreach ($due as $job) {
            $this->line("Đăng job #{$job->id}…");
            $result = $publisher->run($job);
            $this->line("  → {$result->status}");
        }

        // Job đã tải lên xong nhưng TikTok còn xử lý: hỏi lại trạng thái.
        $pending = PublishJob::where('status', 'processing')
            ->where('updated_at', '<=', now()->subSeconds(30))
            ->limit($limit)
            ->get();

        foreach ($pending as $job) {
            $publisher->syncStatus($job);
        }

        $this->info("Đã xử lý {$due->count()} job mới, kiểm tra {$pending->count()} job đang chờ.");

        return self::SUCCESS;
    }
}
