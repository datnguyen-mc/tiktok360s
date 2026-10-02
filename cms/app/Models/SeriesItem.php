<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Một mục trong lộ trình của kênh series — ví dụ một câu lạc bộ. */
class SeriesItem extends Model
{
    protected $table = 'series_items';

    protected $guarded = [];

    protected function casts(): array
    {
        return ['bat' => 'boolean', 'da_dung_luc' => 'datetime'];
    }

    public function episode(): BelongsTo
    {
        return $this->belongsTo(SeriesEpisode::class, 'episode_id');
    }

    /** Chưa lên video và đang bật. */
    public function scopeConLai(Builder $q): Builder
    {
        return $q->whereNull('da_dung_luc')->where('bat', true);
    }

    /**
     * N mục kế tiếp chưa lên video.
     *
     * Đánh dấu bằng `da_dung_luc` chứ không đếm theo số tập: tập bị xoá hay làm
     * lại thì phép đếm sai ngay, còn cái mốc thời gian thì luôn đúng.
     */
    public static function tiepTheo(string $topic, int $n = 1)
    {
        return static::where('topic', $topic)->conLai()->orderBy('so')->limit($n)->get();
    }

    /** Dạng dây chuyền Python đang chờ. */
    public function toPipeline(): array
    {
        return array_filter([
            'so'        => $this->so,
            'ten'       => $this->ten,
            'giai'      => $this->nhom,
            'nam'       => $this->nam,
            'san'       => $this->san,
            'danh_hieu' => $this->danh_hieu,
            'dau_an'    => $this->dau_an,
            'ghi_chu'   => $this->ghi_chu,
        ], fn ($v) => $v !== null && $v !== '');
    }
}
