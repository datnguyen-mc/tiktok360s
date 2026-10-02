<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Nhật ký mọi việc xảy ra trong CMS.
 *
 * Hai nguồn ghi vào đây:
 *   1. Controller tự gọi `write()` với thông điệp tiếng Việt dễ đọc
 *   2. Middleware `LogActivity` ghi mọi request ghi dữ liệu mà (1) bỏ sót
 *
 * Nhờ (2), thêm một endpoint mới mà quên ghi log thì vẫn có dấu vết — không
 * còn chuyện "action này không ai biết đã xảy ra".
 */
class ActivityLog extends Model
{
    protected $guarded = [];

    protected $casts = ['context' => 'array'];

    /**
     * Id các dòng mà controller đã ghi trong request hiện tại.
     *
     * Middleware đọc danh sách này để (a) khỏi ghi thêm một dòng thô trùng nội
     * dung, và (b) bổ sung mã HTTP cùng thời gian vào đúng những dòng đó.
     *
     * Phải nhớ ID chứ không được lấy "dòng mới nhất": hai người dùng bấm cùng
     * lúc thì dòng mới nhất có thể là của người kia, và request này sẽ ghi đè
     * thời gian lên nhật ký của họ.
     */
    public static array $written = [];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function write(string $event, string $message, string $level = 'info',
                                 ?Model $subject = null, array $context = []): self
    {
        $request = request();
        $user = $request?->user();

        $row = static::create([
            'level'        => $level,
            'event'        => $event,
            'message'      => mb_substr($message, 0, 1000),
            'subject_type' => $subject ? $subject::class : null,
            'subject_id'   => $subject?->getKey(),
            'context'      => $context ?: null,
            'user_id'      => $user?->id,
            // Ghi lặp email: tài khoản bị xoá thì user_id thành null, nhưng nhật
            // ký kiểm toán vẫn phải trả lời được câu "ai đã làm việc này".
            'actor'        => $user?->email,
            'ip'           => $request?->ip(),
            'method'       => $request?->method(),
            'path'         => $request ? mb_substr($request->path(), 0, 255) : null,
        ]);

        self::$written[] = $row->id;

        return $row;
    }

    public function scopeLevel(Builder $q, ?string $level): Builder
    {
        return $level ? $q->where('level', $level) : $q;
    }

    /** Tô màu theo mức, dùng chung cho giao diện và dòng lệnh. */
    public const COLORS = [
        'error'   => 'red',
        'warning' => 'yellow',
        'info'    => 'green',
        'debug'   => 'gray',
    ];
}
