<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SessionController extends Controller
{
    public function create(Request $request)
    {
        return Inertia::render('Auth/Login', [
            // Sau khi đăng nhập quay lại đúng trang đang đọc
            'intended' => $request->query('next'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! auth()->attempt($data, $request->boolean('remember', true))) {
            return back()->withErrors(['email' => 'Email hoặc mật khẩu không đúng.']);
        }

        $request->session()->regenerate();
        $request->user()->forceFill(['last_seen_at' => now()])->save();

        // Quản trị viên vào thẳng khu quản trị; độc giả về nơi họ đang đọc
        $fallback = $request->user()->isAdmin() ? '/admin' : '/';

        return redirect()->intended($this->safeNext($request) ?: $fallback);
    }

    /**
     * Chỉ nhận đường dẫn nội bộ cho `next`.
     *
     * Nếu nhận nguyên xi thì kẻ xấu gửi link /login?next=https://trang-gia
     * là đẩy được người vừa đăng nhập sang trang giả mạo — lỗi chuyển hướng mở.
     * `//evil.com` cũng là URL tuyệt đối theo trình duyệt nên phải chặn luôn.
     */
    private function safeNext(Request $request): ?string
    {
        $next = (string) $request->input('next');

        if ($next === '' || ! str_starts_with($next, '/') || str_starts_with($next, '//')) {
            return null;
        }

        return $next;
    }

    public function destroy(Request $request)
    {
        auth()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
