<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Support\Roles;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name', 'email', 'password', 'role', 'username', 'avatar_url', 'bio',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_seen_at'      => 'datetime',
            'password'          => 'hashed',
        ];
    }

    /**
     * Có được vào khu quản trị không?
     *
     * Bảng users dùng chung với CMS video, mà website lại cho đăng ký công khai
     * — nên phải hỏi cột `role`, không phải chỉ hỏi "đã đăng nhập chưa".
     * Tên giữ nguyên `isAdmin` vì CMS video cũng gọi tới.
     */
    public function isAdmin(): bool
    {
        return Roles::canEnterAdmin((string) $this->role);
    }

    /** Toàn quyền — vai trò không bao giờ bị sửa mất quyền. */
    public function isSuperAdmin(): bool
    {
        return $this->role === Roles::SUPER;
    }

    public function hasPermission(string $ability): bool
    {
        return Roles::allows((string) $this->role, $ability);
    }

    /** Danh sách quyền phẳng, gửi xuống giao diện để ẩn thứ không dùng được. */
    public function permissions(): array
    {
        return Roles::abilitiesFor((string) $this->role);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(ArticleLike::class);
    }

    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }
}
