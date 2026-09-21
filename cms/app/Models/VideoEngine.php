<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VideoEngine extends Model
{
    protected $guarded = [];

    protected $hidden = ['api_key', 'api_secret'];

    protected $casts = [
        'api_key'          => 'encrypted',
        'api_secret'       => 'encrypted',
        'cost_per_second'  => 'float',
        'payload_template' => 'array',
        'is_default'       => 'boolean',
        'is_active'        => 'boolean',
        'last_used_at'     => 'datetime',
    ];

    protected $appends = ['has_api_key', 'has_api_secret', 'is_ai'];

    public function runs(): HasMany
    {
        return $this->hasMany(Run::class);
    }

    public function getHasApiKeyAttribute(): bool
    {
        return filled($this->getRawOriginal('api_key'));
    }

    public function getHasApiSecretAttribute(): bool
    {
        return filled($this->getRawOriginal('api_secret'));
    }

    /** Engine sinh cảnh bằng AI (khác với chạy dây chuyền sẵn có). */
    public function getIsAiAttribute(): bool
    {
        return in_array($this->type, ['veo', 'kling'], true);
    }

    /**
     * Đơn giá USD mỗi giây video.
     *
     * Ưu tiên giá người dùng tự nhập (nhà cung cấp đổi giá thì sửa được ngay),
     * sau đó mới tới bảng giá trong config.
     */
    public function pricePerSecond(): ?float
    {
        if ($this->cost_per_second !== null) {
            return $this->cost_per_second;
        }

        // KHÔNG dùng data_get ở đây: mã model chứa dấu chấm ("veo-3.1-…",
        // "kling-v2.5-turbo") mà data_get lại tách khoá theo dấu chấm, nên nó
        // sẽ đi tìm nhánh "veo-3" → "1-generate-preview" và luôn trả về null.
        $pricing = config("aiproviders.{$this->type}.models") ?? [];

        return $pricing[$this->model]['pricing'][$this->resolution] ?? null;
    }

    /** Ước tính chi phí cho một video dài $seconds giây. */
    public function estimateCost(float $seconds): ?array
    {
        $rate = $this->pricePerSecond();
        if ($rate === null || ! $this->is_ai) {
            return null;
        }

        // Clip chỉ có độ dài cố định nên phải làm tròn LÊN theo số clip.
        $clip  = max(1, (int) $this->clip_seconds);
        $clips = (int) ceil($seconds / $clip);
        $billed = $clips * $clip;

        return [
            'clips'         => $clips,
            'billed_seconds' => $billed,
            'rate'          => $rate,
            'per_video'     => round($billed * $rate, 2),
            'per_month'     => round($billed * $rate * 30, 2),
        ];
    }

    /** Chỉ một engine được làm mặc định. */
    protected static function booted(): void
    {
        static::saved(function (self $engine) {
            if ($engine->is_default) {
                static::where('id', '!=', $engine->id)
                    ->where('is_default', true)
                    ->update(['is_default' => false]);
            }
        });
    }
}
