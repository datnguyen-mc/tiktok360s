<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name'       => ['required', 'string', 'max:120'],
            'email'      => ['required', 'email', 'max:190', Rule::unique('users')->ignore($user->id)],
            'avatar_url' => ['nullable', 'url', 'max:1000'],
        ]);

        // Đổi email là đổi định danh đăng nhập — bắt xác nhận mật khẩu hiện tại.
        if ($data['email'] !== $user->email && $user->password) {
            $request->validate(['current_password' => ['required', 'string']]);
            if (! Hash::check($request->string('current_password'), $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => 'Mật khẩu hiện tại không đúng.',
                ]);
            }
        }

        $user->update($data);
        ActivityLog::write('profile.updated', "Cập nhật thông tin: {$user->email}", 'info', $user);

        return response()->json($user->fresh());
    }

    public function changePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            // Tài khoản chỉ đăng nhập Google chưa có mật khẩu — lần đầu đặt thì bỏ qua bước xác nhận.
            'current_password' => [$user->password ? 'required' : 'nullable', 'string'],
            'password'         => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($user->password && ! Hash::check($request->string('current_password'), $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => 'Mật khẩu hiện tại không đúng.',
            ]);
        }

        $user->update(['password' => $request->string('password')->toString()]);

        // Đổi mật khẩu thì các phiên khác phải bị đẩy ra.
        $request->session()->regenerate();
        ActivityLog::write('profile.password_changed', "Đổi mật khẩu: {$user->email}", 'warning', $user);

        return response()->json(['ok' => true]);
    }

    /** Gỡ liên kết Google — chỉ cho phép khi còn mật khẩu để đăng nhập. */
    public function unlinkGoogle(Request $request)
    {
        $user = $request->user();
        abort_unless($user->password, 422,
            'Hãy đặt mật khẩu trước khi gỡ Google, nếu không bạn sẽ không đăng nhập được nữa.');

        $user->forceFill(['google_id' => null])->save();
        ActivityLog::write('profile.google_unlinked', "Gỡ liên kết Google: {$user->email}", 'warning', $user);

        return response()->json($user->fresh());
    }
}
