<?php

namespace App\Models;

use App\Support\Roles;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Role extends Model
{
    protected $primaryKey = 'slug';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['slug', 'name', 'color', 'abilities', 'is_system', 'sort'];

    protected function casts(): array
    {
        return ['abilities' => 'array', 'is_system' => 'boolean'];
    }

    public const CACHE_KEY = 'roles.all';

    /** [slug => ['name'=>…, 'color'=>…, 'abilities'=>[…], 'is_system'=>bool]] */
    public static function map(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, fn () => static::orderBy('sort')
            ->get()->keyBy('slug')
            ->map(fn ($r) => [
                'name'      => $r->name,
                'color'     => $r->color,
                // Bỏ những quyền không còn tồn tại trong code: xoá một quyền
                // khỏi Roles::ABILITIES mà cột JSON vẫn giữ tên cũ thì giao
                // diện sẽ vẽ ra một ô không tương ứng với gì cả.
                'abilities' => array_values(array_intersect(
                    $r->abilities ?: [], array_keys(Roles::ABILITIES)
                )),
                'is_system' => $r->is_system,
                'sort'      => $r->sort,
            ])->all());
    }

    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget(self::CACHE_KEY));
        static::deleted(fn () => Cache::forget(self::CACHE_KEY));
    }
}
