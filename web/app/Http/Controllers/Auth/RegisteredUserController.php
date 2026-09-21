<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class RegisteredUserController extends Controller
{
    public function create()
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:60'],
            'email'    => ['required', 'email', 'max:190', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ], [], [
            'name' => 'tên', 'email' => 'email', 'password' => 'mật khẩu',
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            // Mặc định là độc giả. Quyền quản trị chỉ được cấp tay trong CMS —
            // bảng users dùng chung với CMS video nên đây là ranh giới quan trọng.
            'role'     => 'reader',
            'username' => $this->uniqueUsername($data['name']),
        ]);

        event(new Registered($user));
        auth()->login($user, true);
        $request->session()->regenerate();

        return redirect()->intended('/')->with('success', 'Chào mừng bạn đến với '.config('site.name'));
    }

    /** Tên đăng nhập gợi ý từ họ tên, thêm số nếu trùng. */
    private function uniqueUsername(string $name): string
    {
        $base = Str::limit(Str::slug($name, ''), 24, '') ?: 'user';
        $username = $base;
        $i = 1;
        while (User::where('username', $username)->exists()) {
            $username = $base.(++$i);
        }

        return $username;
    }
}
