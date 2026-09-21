<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Throwable;

/**
 * Cấu hình sửa được từ giao diện.
 *
 * Thứ tự ưu tiên: giá trị trong bảng này → giá trị trong .env. Nhờ vậy người
 * dùng đổi khoá TikTok ngay trên web mà không cần sờ vào file, nhưng máy mới
 * dựng từ .env vẫn chạy được ngay.
 */
class Setting extends Model
{
    protected $guarded = [];

    protected $casts = ['is_secret' => 'boolean'];

    private const CACHE_KEY = 'settings.all';

    /** Khoá nào là bí mật — lưu xuống DB dưới dạng mã hoá, không trả về giao diện. */
    public const SECRETS = [
        'tiktok.client_secret',
        'google.client_secret',
    ];

    /** Khoá nào lấy từ .env khi bảng chưa có giá trị. */
    public const ENV_FALLBACK = [
        'tiktok.client_key'     => 'services.tiktok.client_key',
        'tiktok.client_secret'  => 'services.tiktok.client_secret',
        'tiktok.redirect_uri'   => 'services.tiktok.redirect_uri',
        'tiktok.post_mode'      => 'services.tiktok.post_mode',
        'google.client_id'      => 'services.google.client_id',
        'google.client_secret'  => 'services.google.client_secret',
        'google.redirect_uri'   => 'services.google.redirect',
        'google.allowed_domain' => 'services.google.allowed_domain',
    ];

    public static function get(string $key, mixed $default = null): mixed
    {
        $all = Cache::rememberForever(self::CACHE_KEY, fn () => static::all()->keyBy('key'));
        $row = $all->get($key);

        if ($row) {
            $value = $row->is_secret ? static::decrypt($row->value) : $row->value;
            if ($value !== null && $value !== '') {
                return $value;
            }
        }

        $fallback = self::ENV_FALLBACK[$key] ?? null;

        return $fallback ? (config($fallback) ?? $default) : $default;
    }

    public static function put(string $key, mixed $value, string $group = 'general'): void
    {
        $secret = in_array($key, self::SECRETS, true);

        static::updateOrCreate(['key' => $key], [
            'value'     => $secret && filled($value) ? Crypt::encryptString((string) $value) : $value,
            'group'     => $group,
            'is_secret' => $secret,
        ]);

        Cache::forget(self::CACHE_KEY);
    }

    /** Token cũ có thể chưa mã hoá (hoặc APP_KEY đã đổi) — đừng để nổ. */
    private static function decrypt(?string $value): ?string
    {
        if (! filled($value)) {
            return null;
        }
        try {
            return Crypt::decryptString($value);
        } catch (Throwable) {
            return null;
        }
    }

    /** Giá trị đưa ra giao diện: bí mật chỉ báo "đã đặt hay chưa". */
    public static function forDisplay(array $keys): array
    {
        $out = [];
        foreach ($keys as $key) {
            $value = static::get($key);
            $out[$key] = in_array($key, self::SECRETS, true)
                ? (filled($value) ? '••••••••' : '')
                : (string) ($value ?? '');
        }

        return $out;
    }

    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget(self::CACHE_KEY));
        static::deleted(fn () => Cache::forget(self::CACHE_KEY));
    }
}
