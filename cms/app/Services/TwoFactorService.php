<?php

namespace App\Services;

use App\Models\User;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use PragmaRX\Google2FA\Google2FA;

/**
 * Xác thực hai lớp bằng mã OTP đổi theo thời gian (TOTP) — tương thích
 * Google Authenticator, Authy, 1Password…
 *
 * Luồng bật 2FA có hai bước có chủ đích: tạo bí mật trước, chỉ ghi nhận
 * `two_factor_confirmed_at` sau khi người dùng nhập đúng một mã. Nếu bật ngay
 * lúc tạo, người quét hỏng QR sẽ tự khoá mình khỏi tài khoản.
 */
class TwoFactorService
{
    private Google2FA $engine;

    public function __construct()
    {
        $this->engine = new Google2FA();
        $this->engine->setWindow(1);   // chấp nhận lệch 1 chu kỳ 30 giây
    }

    public function generateSecret(): string
    {
        return $this->engine->generateSecretKey(32);
    }

    /** 8 mã dự phòng dùng một lần, cho trường hợp mất điện thoại. */
    public function generateRecoveryCodes(int $count = 8): array
    {
        return collect(range(1, $count))
            ->map(fn () => strtoupper(bin2hex(random_bytes(4)).'-'.bin2hex(random_bytes(4))))
            ->all();
    }

    public function verify(string $secret, string $code): bool
    {
        return (bool) $this->engine->verifyKey($secret, preg_replace('/\D/', '', $code));
    }

    /**
     * Dùng một mã dự phòng: đúng thì xoá khỏi danh sách rồi trả về true.
     * Mã dự phòng chỉ dùng được một lần, đó là toàn bộ ý nghĩa của nó.
     */
    public function consumeRecoveryCode(User $user, string $code): bool
    {
        $code  = strtoupper(trim($code));
        $codes = $user->two_factor_recovery_codes ?? [];

        $index = array_search($code, $codes, true);
        if ($index === false) {
            return false;
        }

        unset($codes[$index]);
        $user->forceFill(['two_factor_recovery_codes' => array_values($codes)])->save();

        return true;
    }

    /** Mã QR dạng SVG để nhúng thẳng vào trang, không cần gọi dịch vụ ngoài. */
    public function qrSvg(User $user, string $secret): string
    {
        $url = $this->engine->getQRCodeUrl(
            config('app.name', 'TikTok360s'),
            $user->email,
            $secret
        );

        $writer = new Writer(new ImageRenderer(
            new RendererStyle(208, 1),
            new SvgImageBackEnd()
        ));

        return $writer->writeString($url);
    }
}
