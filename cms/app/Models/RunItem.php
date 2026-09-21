<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RunItem extends Model
{
    protected $guarded = [];

    protected $casts = [
        'score'       => 'float',
        'scene_start' => 'float',
        'scene_dur'   => 'float',
    ];

    public function run(): BelongsTo
    {
        return $this->belongsTo(Run::class);
    }
}
