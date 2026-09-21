<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Roles;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserAdminController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Admin/Users', [
            'users' => User::query()
                ->when($request->string('q')->toString(), fn ($q, $t) => $q->where(
                    fn ($w) => $w->where('name', 'like', "%{$t}%")->orWhere('email', 'like', "%{$t}%")
                ))
                ->when($request->string('role')->toString(), fn ($q, $r) => $q->where('role', $r))
                ->when($request->string('verified')->toString(), fn ($q, $v) => $v === 'yes'
                    ? $q->whereNotNull('email_verified_at')
                    : $q->whereNull('email_verified_at'))
                ->withCount(['comments', 'likes', 'bookmarks'])
                ->latest('id')->paginate(25)->withQueryString(),
            'filters' => $request->only(['q', 'role', 'verified']),
            'roles'   => Roles::options(),
            'stats'   => [
                'total'    => User::count(),
                'verified' => User::whereNotNull('email_verified_at')->count(),
            ],
        ]);
    }

    /**
     * Sửa hồ sơ và/hoặc vai trò.
     *
     * Bảng người dùng cho đổi nhanh vai trò ngay trên dòng, nên các trường hồ sơ
     * đều `sometimes` — gửi mỗi `role` thì chỉ vai trò đổi, phần còn lại giữ
     * nguyên. Nếu bắt buộc hết thì lần đổi vai trò nào cũng xoá trắng hồ sơ.
     */
    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'role'     => ['required', Rule::in(Roles::names())],
            'name'     => ['sometimes', 'required', 'string', 'max:60'],
            'email'    => ['sometimes', 'required', 'email', 'max:190',
                           Rule::unique('users', 'email')->ignore($user->id)],
            'username' => ['sometimes', 'nullable', 'string', 'max:40', 'alpha_dash',
                           Rule::unique('users', 'username')->ignore($user->id)],
            'bio'      => ['sometimes', 'nullable', 'string', 'max:300'],
            'verified' => ['sometimes', 'boolean'],
        ], [], ['name' => 'tên', 'email' => 'email', 'username' => 'tên đăng nhập']);

        // Không để ai tự hạ quyền mình rồi khoá luôn chính mình ra ngoài
        if ($user->id === $request->user()->id && $data['role'] !== Roles::SUPER) {
            return back()->with('error', 'Không thể tự hạ quyền chính mình.');
        }

        // Phải luôn còn ít nhất một tài khoản TOÀN QUYỀN. Đếm theo `admin` chứ
        // không phải "vào được khu quản trị" — biên tập viên và kiểm duyệt viên
        // vào được nhưng không đổi quyền, nên họ không cứu được hệ thống.
        if ($user->isSuperAdmin() && $data['role'] !== Roles::SUPER
            && User::where('role', Roles::SUPER)->count() <= 1) {
            return back()->with('error', 'Phải còn ít nhất một tài khoản toàn quyền.');
        }

        // Đổi email là làm mất hiệu lực của lần xác minh trước — địa chỉ mới
        // chưa ai chứng minh là có thật.
        if (array_key_exists('email', $data) && $data['email'] !== $user->email) {
            $user->email_verified_at = null;
        }

        if (array_key_exists('verified', $data)) {
            $user->email_verified_at = $data['verified'] ? ($user->email_verified_at ?? now()) : null;
            unset($data['verified']);
        }

        $user->fill($data)->save();

        return back()->with('success', 'Đã lưu người dùng');
    }

    /** Bật/tắt xác minh email mà không đụng tới phần còn lại của hồ sơ. */
    public function verify(Request $request, User $user)
    {
        $user->forceFill([
            'email_verified_at' => $user->email_verified_at ? null : now(),
        ])->save();

        return back()->with('success', $user->email_verified_at
            ? 'Đã xác minh '.$user->email
            : 'Đã gỡ xác minh '.$user->email);
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'Không thể tự xoá tài khoản đang đăng nhập.');
        }
        if ($user->isSuperAdmin() && User::where('role', Roles::SUPER)->count() <= 1) {
            return back()->with('error', 'Phải còn ít nhất một tài khoản toàn quyền.');
        }

        $user->delete();

        return back()->with('success', 'Đã xoá người dùng');
    }
}
