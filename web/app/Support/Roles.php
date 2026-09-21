<?php

namespace App\Support;

use App\Models\Role;
use Throwable;

/**
 * Cầu nối giữa *danh mục quyền* (nằm trong code) và *vai trò* (nằm trong CSDL).
 *
 * Quyền phải khai ở đây vì mỗi quyền tương ứng với một chỗ kiểm tra trong code
 * — thêm quyền bằng giao diện mà không có dòng nào đọc tới thì chỉ là một ô
 * tích vô nghĩa. Còn "vai trò nào có quyền nào" thì quản trị viên đổi được
 * trong trang Vai trò.
 */
final class Roles
{
    /** Quyền, nhóm lại để trang quản trị vẽ theo từng khối. */
    public const GROUPS = [
        'Nội dung' => [
            'articles.view'     => 'Xem danh sách tin bài',
            'articles.edit'     => 'Viết và sửa tin bài',
            'articles.delete'   => 'Xoá tin bài',
            'categories.view'   => 'Xem chuyên mục',
            'categories.edit'   => 'Thêm, sửa, xoá chuyên mục',
            'pages.view'        => 'Xem trang tĩnh',
            'pages.edit'        => 'Thêm, sửa, xoá trang tĩnh',
        ],
        'Cộng đồng' => [
            'comments.view'     => 'Xem bình luận',
            'comments.moderate' => 'Ẩn, đánh dấu spam, xoá bình luận',
            'users.view'        => 'Xem danh sách người dùng',
            'users.manage'      => 'Đổi quyền và xoá người dùng',
        ],
        'Hệ thống' => [
            'reports.view'      => 'Xem báo cáo truy cập',
            'roles.manage'      => 'Sửa vai trò và phân quyền',
            'settings.manage'   => 'Sửa cấu hình website',
        ],
    ];

    /** Mọi quyền, phẳng: ['articles.view' => 'Xem danh sách tin bài', …] */
    public const ABILITIES = self::GROUPS['Nội dung']
        + self::GROUPS['Cộng đồng']
        + self::GROUPS['Hệ thống'];

    /** Vai trò mặc định, dùng để gieo dữ liệu lần đầu và làm phương án dự phòng. */
    public const SEED = [
        'admin' => ['name' => 'Quản trị', 'color' => '#D91644', 'sort' => 10,
                    'is_system' => true, 'abilities' => ['*']],
        'editor' => ['name' => 'Biên tập', 'color' => '#0A9CB0', 'sort' => 20,
                     'is_system' => false, 'abilities' => [
                         'articles.view', 'articles.edit', 'articles.delete',
                         'categories.view', 'categories.edit',
                         'pages.view', 'pages.edit',
                         'comments.view', 'comments.moderate',
                         'reports.view',
                     ]],
        'moderator' => ['name' => 'Kiểm duyệt', 'color' => '#7C3AED', 'sort' => 30,
                        'is_system' => false, 'abilities' => ['comments.view', 'comments.moderate']],
        'reader' => ['name' => 'Độc giả', 'color' => '#74747F', 'sort' => 90,
                     'is_system' => true, 'abilities' => []],
    ];

    /** Vai trò toàn quyền — không bao giờ bị sửa mất quyền. */
    public const SUPER = 'admin';

    private static function all(): array
    {
        try {
            $map = Role::map();
        } catch (Throwable) {
            $map = [];   // chưa migrate: dùng bản gieo sẵn
        }

        if ($map === []) {
            foreach (self::SEED as $slug => $r) {
                $map[$slug] = [...$r, 'abilities' => $slug === self::SUPER
                    ? array_keys(self::ABILITIES) : $r['abilities']];
            }
        }

        return $map;
    }

    public static function names(): array
    {
        return array_keys(self::all());
    }

    public static function exists(string $role): bool
    {
        return isset(self::all()[$role]);
    }

    public static function label(string $role): string
    {
        return self::all()[$role]['name'] ?? 'Độc giả';
    }

    public static function color(string $role): string
    {
        return self::all()[$role]['color'] ?? '#74747F';
    }

    /** Quyền của một vai trò. `admin` luôn nhận hết, bất kể cột JSON ghi gì. */
    public static function abilitiesFor(string $role): array
    {
        if ($role === self::SUPER) {
            return array_keys(self::ABILITIES);
        }

        return self::all()[$role]['abilities'] ?? [];
    }

    public static function allows(string $role, string $ability): bool
    {
        return in_array($ability, self::abilitiesFor($role), true);
    }

    public static function canEnterAdmin(string $role): bool
    {
        return self::abilitiesFor($role) !== [];
    }

    /** Dạng gọn cho giao diện. */
    public static function options(): array
    {
        return array_map(fn ($slug) => [
            'value'     => $slug,
            'label'     => self::label($slug),
            'color'     => self::color($slug),
            'abilities' => self::abilitiesFor($slug),
        ], self::names());
    }
}
