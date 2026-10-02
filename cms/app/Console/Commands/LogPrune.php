<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use Illuminate\Console\Command;

/**
 * Dọn nhật ký cũ.
 *
 * Mỗi request ghi dữ liệu là một dòng, nên bảng này lớn nhanh hơn mọi bảng khác.
 * Giữ lỗi lâu hơn thông tin thường: dòng `info` chỉ có giá trị trong vài tuần,
 * còn dòng `error` là thứ người ta tìm lại sau ba tháng khi có sự cố.
 */
class LogPrune extends Command
{
    protected $signature = 'log:prune
                            {--days=30 : Giữ dòng thông tin trong bao nhiêu ngày}
                            {--error-days=180 : Giữ dòng lỗi và cảnh báo lâu hơn}
                            {--dry : Chỉ đếm, không xoá}';

    protected $description = 'Xoá nhật ký hoạt động đã cũ';

    public function handle(): int
    {
        $days = max(1, (int) $this->option('days'));
        $errorDays = max($days, (int) $this->option('error-days'));

        $info = ActivityLog::whereNotIn('level', ['error', 'warning'])
            ->where('created_at', '<', now()->subDays($days));

        $errors = ActivityLog::whereIn('level', ['error', 'warning'])
            ->where('created_at', '<', now()->subDays($errorDays));

        if ($this->option('dry')) {
            $this->line(sprintf('  sẽ xoá %s dòng thông tin (cũ hơn %d ngày)',
                number_format($info->count()), $days));
            $this->line(sprintf('  sẽ xoá %s dòng lỗi/cảnh báo (cũ hơn %d ngày)',
                number_format($errors->count()), $errorDays));

            return self::SUCCESS;
        }

        $a = $info->delete();
        $b = $errors->delete();

        $this->info(sprintf('Đã xoá %s dòng · còn lại %s',
            number_format($a + $b), number_format(ActivityLog::count())));

        return self::SUCCESS;
    }
}
