<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Services\TwoFactorService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/** Bật / tắt xác thực hai lớp cho tài khoản đang đăng nhập. */
class TwoFactorController extends Controller
{
    public function __construct(private TwoFactorService $twoFactor) {}

    /**
     * Bước 1 — tạo bí mật và mã QR. Chưa bật: phải nhập đúng một mã mới tính.
     */
    public function enroll(Request $request)
    {
        $user = $request->user();
        abort_if($user->two_factor_enabled, 422, 'Tài khoản đã bật xác thực hai lớp.');

        $secret = $this->twoFactor->generateSecret();
        $user->forceFill([
            'two_factor_secret'         => $secret,
            'two_factor_recovery_codes' => $this->twoFactor->generateRecoveryCodes(),
            'two_factor_confirmed_at'   => null,
        ])->save();

        return response()->json([
            'secret'         => $secret,     // hiện để nhập tay khi không quét được QR
            'qr_svg'         => $this->twoFactor->qrSvg($user, $secret),
            'recovery_codes' => $user->two_factor_recovery_codes,
        ]);
    }

    /** Bước 2 — xác nhận bằng một mã thật từ ứng dụng. */
    public function confirm(Request $request)
    {
        $request->validate(['code' => ['required', 'string', 'max:10']]);
        $user = $request->user();

        abort_unless($user->two_factor_secret, 422, 'Chưa tạo mã — bấm “Bật xác thực hai lớp” trước.');

        if (! $this->twoFactor->verify($user->two_factor_secret, $request->string('code')->toString())) {
            throw ValidationException::withMessages([
                'code' => 'Mã không đúng. Kiểm tra giờ trên điện thoại có lệch không.',
            ]);
        }

        $user->forceFill(['two_factor_confirmed_at' => now()])->save();
        ActivityLog::write('auth.2fa_enabled', "Bật xác thực hai lớp: {$user->email}", 'info', $user);

        return response()->json(['enabled' => true, 'recovery_codes' => $user->two_factor_recovery_codes]);
    }

    /** Tắt 2FA — yêu cầu nhập mật khẩu để tránh bị tắt khi máy bỏ quên đang mở. */
    public function disable(Request $request)
    {
        $request->validate(['password' => ['required', 'string']]);
        $user = $request->user();

        if ($user->password && ! password_verify($request->string('password'), $user->password)) {
            throw ValidationException::withMessages(['password' => 'Mật khẩu không đúng.']);
        }

        $user->forceFill([
            'two_factor_secret'         => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at'   => null,
        ])->save();

        ActivityLog::write('auth.2fa_disabled', "Tắt xác thực hai lớp: {$user->email}", 'warning', $user);

        return response()->json(['enabled' => false]);
    }

    public function recoveryCodes(Request $request)
    {
        $user = $request->user();
        abort_unless($user->two_factor_enabled, 422, 'Chưa bật xác thực hai lớp.');

        $codes = $this->twoFactor->generateRecoveryCodes();
        $user->forceFill(['two_factor_recovery_codes' => $codes])->save();

        return response()->json(['recovery_codes' => $codes]);
    }
}
