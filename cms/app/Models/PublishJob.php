<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PublishJob extends Model
{
    protected $guarded = [];

    protected $casts = [
        'scheduled_at'  => 'datetime',
        'started_at'    => 'datetime',
        'published_at'  => 'datetime',
        'last_response' => 'array',
    ];

    /** Các trạng thái mà TikTok còn đang xử lý, cần hỏi lại. */
    public const IN_FLIGHT = ['queued', 'uploading', 'processing'];

    public function run(): BelongsTo
    {
        return $this->belongsTo(Run::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(TiktokAccount::class, 'tiktok_account_id');
    }

    public function markFailed(string $message, ?array $response = null): void
    {
        $this->update([
            'status'        => 'failed',
            'error_message' => mb_substr($message, 0, 2000),
            'last_response' => $response,
        ]);
    }
}
