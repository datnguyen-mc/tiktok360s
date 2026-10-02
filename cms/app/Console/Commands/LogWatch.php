<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use Illuminate\Console\Command;

/**
 * Xem nhật ký hoạt động ngay trên dòng lệnh.
 *
 *   php artisan log:watch              theo dõi liên tục (như tail -f)
 *   php artisan log:watch --last=50    xem 50 dòng gần nhất rồi thoát
 *   php artisan log:watch --level=error
 *   php artisan log:watch --event=publish
 *   php artisan log:watch --user=ban@vidu.vn
 *   php artisan log:watch --full       hiện cả dữ liệu gửi lên
 */
class LogWatch extends Command
{
    protected $signature = 'log:watch
                            {--last=25 : Số dòng gần nhất hiện ra trước}
                            {--level= : Lọc theo mức (error|warning|info)}
                            {--event= : Lọc theo tên sự kiện, khớp một phần}
                            {--user= : Lọc theo email người thực hiện}
                            {--path= : Lọc theo đường dẫn, khớp một phần}
                            {--errors : Chỉ hiện lỗi và cảnh báo}
                            {--full : Hiện cả ngữ cảnh và dữ liệu gửi lên}
                            {--once : Hiện rồi thoát, không theo dõi tiếp}';

    protected $description = 'Xem nhật ký hoạt động của CMS';

    private const TINT = [
        'error'   => 'red',
        'warning' => 'yellow',
        'info'    => 'green',
        'debug'   => 'gray',
    ];

    public function handle(): int
    {
        $rows = $this->query()->latest('id')->limit((int) $this->option('last'))->get()->reverse();

        $this->header();

        foreach ($rows as $row) {
            $this->render($row);
        }

        if ($this->option('once')) {
            return self::SUCCESS;
        }

        $this->line('');
        $this->comment('  Đang theo dõi… Ctrl-C để dừng.');
        $this->line('');

        $lastId = $rows->last()?->id ?? 0;

        // Hỏi lại mỗi giây. Đơn giản và đủ: nhật ký CMS không sinh ra hàng nghìn
        // dòng mỗi giây, và cách này chạy được ở mọi nơi mà không cần thêm gì.
        while (true) {
            $fresh = $this->query()->where('id', '>', $lastId)->orderBy('id')->get();

            foreach ($fresh as $row) {
                $this->render($row);
                $lastId = $row->id;
            }

            usleep(1_000_000);
        }
    }

    private function query()
    {
        return ActivityLog::query()
            ->when($this->option('level'), fn ($q, $v) => $q->where('level', $v))
            ->when($this->option('errors'), fn ($q) => $q->whereIn('level', ['error', 'warning']))
            ->when($this->option('event'), fn ($q, $v) => $q->where('event', 'like', "%{$v}%"))
            ->when($this->option('user'), fn ($q, $v) => $q->where('actor', 'like', "%{$v}%"))
            ->when($this->option('path'), fn ($q, $v) => $q->where('path', 'like', "%{$v}%"));
    }

    private function header(): void
    {
        $filters = array_filter([
            $this->option('level') ? 'mức '.$this->option('level') : null,
            $this->option('errors') ? 'chỉ lỗi' : null,
            $this->option('event') ? 'sự kiện ~'.$this->option('event') : null,
            $this->option('user') ? 'người dùng ~'.$this->option('user') : null,
            $this->option('path') ? 'đường dẫn ~'.$this->option('path') : null,
        ]);

        $this->line('');
        $this->line('  <options=bold>Nhật ký hoạt động</> '
            .($filters ? '<fg=gray>('.implode(' · ', $filters).')</>' : ''));
        $this->line('  <fg=gray>'.str_repeat('─', 76).'</>');
    }

    private function render(ActivityLog $r): void
    {
        $tint = self::TINT[$r->level] ?? 'white';
        $mark = match ($r->level) {
            'error'   => '✗',
            'warning' => '!',
            default   => '✓',
        };

        $when = $r->created_at?->format('H:i:s') ?? '--:--:--';
        $who  = $r->actor ? str($r->actor)->before('@')->toString() : '—';
        $took = $r->duration_ms !== null ? sprintf('%dms', $r->duration_ms) : '';

        $this->line(sprintf(
            '  <fg=gray>%s</> <fg=%s>%s</> <fg=%s;options=bold>%-22s</> %s',
            $when, $tint, $mark, $tint, str($r->event)->limit(22, ''), $r->message
        ));

        $meta = array_filter([
            $who !== '—' ? "bởi {$who}" : null,
            $r->status ? "HTTP {$r->status}" : null,
            $took ?: null,
            $r->ip && $r->ip !== '127.0.0.1' ? $r->ip : null,
        ]);

        if ($meta) {
            $this->line('           <fg=gray>'.implode(' · ', $meta).'</>');
        }

        if ($this->option('full') && $r->context) {
            foreach ($r->context as $key => $value) {
                $this->line('           <fg=gray>'.$key.': '
                    .str(is_scalar($value) ? (string) $value
                        : json_encode($value, JSON_UNESCAPED_UNICODE))->limit(140)
                    .'</>');
            }
        }
    }
}
