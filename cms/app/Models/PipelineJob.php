<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Symfony\Component\Process\Process;

/** Một tiến trình dây chuyền đang chạy hoặc đã chạy xong. */
class PipelineJob extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'run_date'    => 'date',
            'started_at'  => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    public function run(): BelongsTo
    {
        return $this->belongsTo(Run::class);
    }

    public function engine(): BelongsTo
    {
        return $this->belongsTo(VideoEngine::class, 'video_engine_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeDangChay(Builder $q): Builder
    {
        return $q->where('status', 'running');
    }

    /** Tiến trình còn sống thật không — PID có thể đã chết mà bảng chưa biết. */
    public function alive(): bool
    {
        if (! $this->pid || $this->status !== 'running') {
            return false;
        }

        return posix_kill($this->pid, 0) || posix_get_last_error() === PCNTL_EPERM;
    }

    /**
     * Dừng tiến trình và toàn bộ tiến trình con.
     *
     * Phải giết cả cây chứ không chỉ mỗi PID: dây chuyền Python sinh ra ffmpeg
     * và edge-tts, giết mỗi tiến trình cha thì lũ con thành mồ côi và vẫn ngốn
     * CPU cho tới khi xong một việc chẳng ai cần nữa.
     *
     * Gửi TERM trước để chương trình còn kịp dọn dẹp, chờ một nhịp rồi mới KILL.
     */
    public function stop(): bool
    {
        if (! $this->pid) {
            return false;
        }

        $pids = array_reverse($this->cayTienTrinh($this->pid));   // con trước, cha sau

        foreach ($pids as $pid) {
            @posix_kill($pid, SIGTERM);
        }

        usleep(700_000);

        foreach ($pids as $pid) {
            if (@posix_kill($pid, 0)) {
                @posix_kill($pid, SIGKILL);
            }
        }

        $this->update([
            'status'      => 'stopped',
            'finished_at' => now(),
            'note'        => 'Dừng bằng tay từ CMS',
        ]);

        return true;
    }

    /** PID của tiến trình và mọi tiến trình con, cháu. */
    private function cayTienTrinh(int $goc): array
    {
        $p = new Process(['ps', '-eo', 'pid=,ppid=']);
        $p->run();

        $con = [];
        foreach (explode("\n", trim($p->getOutput())) as $dong) {
            $phan = preg_split('/\s+/', trim($dong));
            if (count($phan) >= 2) {
                $con[(int) $phan[1]][] = (int) $phan[0];
            }
        }

        $ra = [];
        $hang = [$goc];
        while ($hang) {
            $pid = array_shift($hang);
            if (in_array($pid, $ra, true)) {
                continue;       // vòng lặp cha-con bất thường thì dừng, khỏi treo
            }
            $ra[] = $pid;
            foreach ($con[$pid] ?? [] as $c) {
                $hang[] = $c;
            }
        }

        return $ra;
    }
}
