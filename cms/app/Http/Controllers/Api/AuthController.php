<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use App\Services\TwoFactorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /** Khoá phiên giữ id người dùng đã qua bước mật khẩu, đang chờ nhập mã OTP. */
    private const PENDING = 'auth.pending_2fa';

    public function __construct(private TwoFactorService $twoFactor) {}

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! $user->password || ! Auth::getProvider()->validateCredentials($user, $data)) {
            throw ValidationException::withMessages(['email' => 'Email hoặc mật khẩu không đúng.']);
        }

        // Có 2FA thì dừng lại ở đây: chưa đăng nhập, chỉ ghi nhận đã qua mật khẩu.
        if ($user->two_factor_enabled) {
            $request->session()->put(self::PENDING, $user->id);

            return response()->json(['two_factor' => true]);
        }

        return $this->completeLogin($request, $user);
    }

    /** Bước hai: mã OTP 6 số, hoặc một mã dự phòng. */
    public function twoFactorChallenge(Request $request)
    {
        $request->validate(['code' => ['required', 'string', 'max:40']]);

        $userId = $request->session()->get(self::PENDING);
        if (! $userId) {
            throw ValidationException::withMessages(['code' => 'Phiên đã hết hạn, đăng nhập lại từ đầu.']);
        }

        $user = User::findOrFail($userId);
        $code = trim($request->string('code')->toString());

        $ok = $this->twoFactor->verify($user->two_factor_secret, $code)
            || $this->twoFactor->consumeRecoveryCode($user, $code);

        if (! $ok) {
            ActivityLog::write('auth.2fa_failed', "Nhập sai mã OTP: {$user->email}", 'warning', $user);
            throw ValidationException::withMessages(['code' => 'Mã không đúng hoặc đã hết hạn.']);
        }

        $request->session()->forget(self::PENDING);

        return $this->completeLogin($request, $user);
    }

    /** Trạng thái cho giao diện biết có đang chờ nhập mã hay không. */
    public function status(Request $request)
    {
        return response()->json([
            'pending_two_factor' => (bool) $request->session()->get(self::PENDING),
            'google_enabled'     => filled(\App\Models\Setting::get('google.client_id')),
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['ok' => true]);
    }

    private function completeLogin(Request $request, User $user)
    {
        Auth::login($user, true);
        $request->session()->regenerate();
        ActivityLog::write('auth.login', "Đăng nhập: {$user->email}", 'info', $user);

        return response()->json($user);
    }
}
