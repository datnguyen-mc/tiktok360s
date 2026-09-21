<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Run extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'run_date'      => 'date',
        'started_at'    => 'datetime',
        'finished_at'   => 'datetime',
        'duration_sec'  => 'float',
        'estimated_sec' => 'float',
    ];

    protected $appends = ['drift_sec', 'has_video'];

    public function items(): HasMany
    {
        return $this->hasMany(RunItem::class)->orderBy('position');
    }

    public function steps(): HasMany
    {
        return $this->hasMany(RunStep::class)->orderBy('sequence');
    }

    public function publishJobs(): HasMany
    {
        return $this->hasMany(PublishJob::class)->latest('id');
    }

    /** Sai số của mô hình ước lượng thời lượng — dương là dựng hụt, âm là dựng dư. */
    public function getDriftSecAttribute(): ?float
    {
        if ($this->duration_sec === null || $this->estimated_sec === null) {
            return null;
        }

        return round($this->duration_sec - $this->estimated_sec, 2);
    }

    public function getHasVideoAttribute(): bool
    {
        return $this->hasLocalVideo() || (bool) $this->video_url;
    }

    /** File còn nằm trên chính máy chạy dây chuyền hay không. */
    public function hasLocalVideo(): bool
    {
        return $this->video_path && is_file($this->absoluteVideoPath());
    }

    public function hasLocalThumbnail(): bool
    {
        return $this->thumbnail_path && is_file($this->absoluteThumbnailPath());
    }

    /** Đường dẫn tuyệt đối tới file video, dựng từ PIPELINE_ROOT. */
    public function absoluteVideoPath(): string
    {
        return $this->resolve($this->video_path);
    }

    public function absoluteThumbnailPath(): string
    {
        return $this->resolve($this->thumbnail_path);
    }

    private function resolve(?string $path): string
    {
        if (! $path) {
            return '';
        }

        return str_starts_with($path, '/')
            ? $path
            : rtrim((string) config('pipeline.root'), '/').'/'.ltrim($path, '/');
    }

    public function scopeSuccessful($query)
    {
        return $query->where('status', 'success');
    }
}
