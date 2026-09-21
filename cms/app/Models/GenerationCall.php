<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Một lần gọi API sinh cảnh bằng AI, kèm chi phí. */
class GenerationCall extends Model
{
    protected $guarded = [];

    protected $casts = [
        'run_date'        => 'date',
        'cost_usd'        => 'float',
        'cost_per_second' => 'float',
    ];

    public function run(): BelongsTo
    {
        return $this->belongsTo(Run::class);
    }

    public function engine(): BelongsTo
    {
        return $this->belongsTo(VideoEngine::class, 'video_engine_id');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }
}
