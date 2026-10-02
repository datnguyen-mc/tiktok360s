<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Địa chỉ cũ của chuyên mục, trang tĩnh và bài viết sau khi đổi slug.
 *
 * Không có bảng này thì mỗi lần sửa slug là mọi liên kết đã chia sẻ thành 404,
 * và thứ hạng Google của đường dẫn cũ mất trắng.
 */
class SlugRedirect extends Model
{
    public $timestamps = false;

    protected $fillable = ['kind', 'old_slug', 'new_slug', 'created_at'];

    /** Slug mới tương ứng, hoặc null nếu địa chỉ cũ này chưa từng tồn tại. */
    public static function to(string $kind, string $oldSlug): ?string
    {
        return static::where('kind', $kind)->where('old_slug', $oldSlug)->value('new_slug');
    }

    /** Ghi lại một lần đổi slug, và nối lại các chuỗi chuyển hướng cũ. */
    public static function record(string $kind, string $oldSlug, string $newSlug): void
    {
        if ($oldSlug === $newSlug) {
            return;
        }

        static::updateOrInsert(
            ['kind' => $kind, 'old_slug' => $oldSlug],
            ['new_slug' => $newSlug, 'created_at' => now()]
        );

        // A→B rồi B→C: phải sửa A trỏ thẳng C, nếu không người vào A bị chuyển
        // hai lần và Google coi đó là lỗi chuỗi chuyển hướng.
        static::where('kind', $kind)->where('new_slug', $oldSlug)
            ->update(['new_slug' => $newSlug]);

        // Và xoá dòng tự trỏ vào chính mình nếu vòng lại
        static::where('kind', $kind)->whereColumn('old_slug', 'new_slug')->delete();
    }
}
