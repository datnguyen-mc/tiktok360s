<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;
use Throwable;

/**
 * Đăng nhập bằng Google.
 *
 * Khoá lấy từ bảng settings (sửa được trên web) nên provider được dựng thủ công
 * thay vì đọc thẳng config — đổi khoá không cần khởi động lại ứng dụng.
 *
 * Ai được vào:
 *   - email đã có sẵn trong bảng users, hoặc
 *   - email thuộc tên miền khai ở `google.allowed_domain` (khi đó tài khoản tự tạo).
 * Không có hai điều kiện đó thì từ chối — nếu không, bất kỳ ai có Gmail cũng vào được.
 */
class GoogleAuthController extends Controller
{
    private function provider(): GoogleProvider
    {
        return Socialite::buildProvider(GoogleProvider::class, [
            'client_id'     => Setting::get('google.client_id'),
            'client_secret' => Setting::get('google.client_secret'),
            'redirect'      => Setting::get('google.redirect_uri') ?: url('/auth/google/callback'),
        ]);
    }

    public function redirect()
    {
        if (! filled(Setting::get('google.client_id')) || ! filled(Setting::get('google.client_secret'))) {
            return redirect('/login?error='.urlencode(
                'Chưa cấu hình Google — vào mục Cài đặt để điền Client ID và Secret.'
            ));
        }

        return $this->provider()->redirect();
    }

    public function callback(Request $request)
    {
        try {
            $google = $this->provider()->user();
        } catch (Throwable $e) {
            ActivityLog::write('auth.google_failed', $e->getMessage(), 'error');

            return redirect('/login?error='.urlencode('Đăng nhập Google thất bại: '.$e->getMessage()));
        }

        $email = $google->getEmail();
        if (! $email) {
            return redirect('/login?error='.urlencode('Tài khoản Google không có email.'));
        }

        $user   = User::where('email', $email)->orWhere('google_id', $google->getId())->first();
        $domain = trim((string) Setting::get('google.allowed_domain'));

        if (! $user) {
            $matchesDomain = $domain !== '' && str_ends_with(strtolower($email), '@'.strtolower($domain));
            if (! $matchesDomain) {
                ActivityLog::write('auth.google_denied', "Từ chối đăng nhập: {$email}", 'warning');

                return redirect('/login?error='.urlencode(
                    "Email {$email} chưa được cấp quyền vào CMS này."
                ));
            }

            $user = new User(['name' => $google->getName() ?: $email, 'email' => $email]);
        }

        $user->forceFill([
            'google_id'  => $google->getId(),
            'avatar_url' => $google->getAvatar(),
        ])->save();

        // Bật 2FA thì vẫn phải qua bước nhập mã, kể cả khi Google đã xác thực.
        if ($user->two_factor_enabled) {
            $request->session()->put('auth.pending_2fa', $user->id);

            return redirect('/login?two_factor=1');
        }

        Auth::login($user, true);
        $request->session()->regenerate();
        ActivityLog::write('auth.login', "Đăng nhập bằng Google: {$email}", 'info', $user);

        return redirect('/');
    }
}
