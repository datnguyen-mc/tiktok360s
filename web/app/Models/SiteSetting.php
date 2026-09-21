<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SiteSetting extends Model
{
    protected $table = 'web_settings';
    protected $primaryKey = 'key';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['key', 'value'];

    public const CACHE_KEY = 'web_settings.all';

    /**
     * Toàn bộ thiết lập, đã gộp lên giá trị mặc định trong `config/site.php`.
     *
     * Cache vĩnh viễn và tự xoá khi lưu — thiết lập site bị đọc ở mọi request
     * (qua middleware Inertia), truy vấn mỗi lần là phí.
     */
    public static function values(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function () {
            $stored = static::query()->pluck('value', 'key')->all();

            return array_merge(self::defaults(), array_filter(
                $stored, fn ($v) => $v !== null && $v !== ''
            ));
        });
    }

    public static function get(string $key, mixed $fallback = null): mixed
    {
        return self::values()[$key] ?? $fallback;
    }

    public static function defaults(): array
    {
        return [
            'name'        => config('site.name'),
            'tagline'     => config('site.tagline'),
            'description' => config('site.tagline').' — tin showbiz, bóng đá và giải trí cập nhật liên tục.',
            'logo'        => config('site.logo'),
            'per_page'    => (string) config('site.per_page'),
            'ga'          => (string) config('site.google_analytics_id'),
            'email'       => '',
            'hotline'     => '',
            'address'     => '',
            'facebook'    => '',
            'youtube'     => '',
            'tiktok'      => '',
            'copyright'   => '',
        ];
    }

    public static function put(array $values): void
    {
        foreach ($values as $key => $value) {
            static::updateOrCreate(['key' => $key], ['value' => (string) ($value ?? '')]);
        }

        Cache::forget(self::CACHE_KEY);
    }
}
