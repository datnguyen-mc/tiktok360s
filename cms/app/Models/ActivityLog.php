<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $guarded = [];

    protected $casts = ['context' => 'array'];

    public static function write(string $event, string $message, string $level = 'info',
                                 ?Model $subject = null, array $context = []): self
    {
        return static::create([
            'level'        => $level,
            'event'        => $event,
            'message'      => mb_substr($message, 0, 1000),
            'subject_type' => $subject ? $subject::class : null,
            'subject_id'   => $subject?->getKey(),
            'context'      => $context ?: null,
        ]);
    }
}
