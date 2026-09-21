<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TiktokAccount extends Model
{
    protected $guarded = [];

    protected $hidden = ['access_token', 'refresh_token'];

    protected $casts = [
        // Token nằm trong DB dưới dạng mã hoá; Laravel tự giải mã khi đọc.
        'access_token'       => 'encrypted',
        'refresh_token'      => 'encrypted',
        'access_expires_at'  => 'datetime',
        'refresh_expires_at' => 'datetime',
        'creator_info_at'    => 'datetime',
        'creator_info'       => 'array',
        'is_active'          => 'boolean',
    ];

    protected $appends = ['token_expired', 'refresh_expired'];

    public function engine(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(VideoEngine::class, 'video_engine_id');
    }

    public function publishJobs(): HasMany
    {
        return $this->hasMany(PublishJob::class);
    }

    public function getTokenExpiredAttribute(): bool
    {
        return $this->access_expires_at === null || $this->access_expires_at->isPast();
    }

    /** Hết hạn refresh token nghĩa là phải kết nối lại từ đầu. */
    public function getRefreshExpiredAttribute(): bool
    {
        return $this->refresh_expires_at !== null && $this->refresh_expires_at->isPast();
    }
}
