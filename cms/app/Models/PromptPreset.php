<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PromptPreset extends Model
{
    protected $guarded = [];

    protected $casts = ['last_used_at' => 'datetime'];

    public function engine(): BelongsTo
    {
        return $this->belongsTo(VideoEngine::class, 'video_engine_id');
    }

    public function markUsed(): void
    {
        $this->increment('usage_count');
        $this->update(['last_used_at' => now()]);
    }
}
