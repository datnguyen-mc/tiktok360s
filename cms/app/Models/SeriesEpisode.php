<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Một tập của kênh phim nhiều tập. */
class SeriesEpisode extends Model
{
    protected $table = 'series_episodes';

    protected $guarded = [];

    protected $casts = [
        'ngay' => 'date',
        'canh' => 'array',
        'muc'  => 'array',
    ];

    public function run(): BelongsTo
    {
        return $this->belongsTo(Run::class);
    }

    /** Tập gần nhất của một chủ đề — điểm tựa để viết tập kế tiếp. */
    public static function latestFor(string $topic): ?self
    {
        return static::where('topic', $topic)->orderByDesc('so_tap')->first();
    }
}
