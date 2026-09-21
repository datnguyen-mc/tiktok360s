<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Support\Roles;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RoleAdminController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Roles', [
            'roles' => Role::orderBy('sort')->get()->map(fn ($r) => [
                ...$r->only(['slug', 'name', 'color', 'is_system', 'sort']),
                'abilities' => Roles::abilitiesFor($r->slug),
                'users'     => User::where('role', $r->slug)->count(),
            ])->all(),
            'groups' => Roles::GROUPS,
            'super'  => Roles::SUPER,
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        Role::create([...$data, 'is_system' => false]);

        return back()->with('success', 'Đã tạo vai trò');
    }

    public function update(Request $request, Role $role)
    {
        // Vai trò toàn quyền không cho sửa quyền: gỡ nhầm một ô là khoá luôn cả
        // hệ thống, mà lúc đó không còn ai vào để gỡ lại.
        if ($role->slug === Roles::SUPER) {
            $data = $request->validate([
                'name'  => ['required', 'string', 'max:60'],
                'color' => ['required', 'string', 'max:9'],
            ]);
        } else {
            $data = $this->validated($request, $role->slug);
            unset($data['slug']);   // đổi slug là mọi user mang vai trò đó mất quyền
        }

        $role->update($data);

        return back()->with('success', 'Đã lưu vai trò');
    }

    public function destroy(Role $role)
    {
        if ($role->is_system) {
            return back()->with('error', 'Không thể xoá vai trò hệ thống.');
        }

        $n = User::where('role', $role->slug)->count();
        if ($n > 0) {
            return back()->with('error',
                "Còn {$n} tài khoản đang mang vai trò này. Hãy chuyển họ sang vai trò khác trước.");
        }

        $role->delete();

        return back()->with('success', 'Đã xoá vai trò');
    }

    private function validated(Request $request, ?string $ignore = null): array
    {
        $data = $request->validate([
            'slug'        => ['required', 'string', 'max:30', 'alpha_dash',
                              Rule::unique('roles', 'slug')->ignore($ignore, 'slug')],
            'name'        => ['required', 'string', 'max:60'],
            'color'       => ['required', 'string', 'max:9'],
            'sort'        => ['integer', 'min:0', 'max:999'],
            'abilities'   => ['array'],
            'abilities.*' => [Rule::in(array_keys(Roles::ABILITIES))],
        ], [], ['name' => 'tên vai trò', 'slug' => 'mã vai trò']);

        $data['abilities'] = array_values($data['abilities'] ?? []);

        return $data;
    }
}
