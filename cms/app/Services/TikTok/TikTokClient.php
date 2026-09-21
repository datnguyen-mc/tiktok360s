<?php

namespace App\Services\TikTok;

use App\Models\Setting;
use App\Models\TiktokAccount;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Bọc TikTok Open API v2 (OAuth + Content Posting).
 *
 * Tài liệu: https://developers.tiktok.com/doc/content-posting-api-get-started
 *
 * Hai điều quyết định việc đăng bài có chạy được hay không, nằm ở phía TikTok
 * chứ không nằm ở code này:
 *   1. Scope `video.publish` (đăng thẳng) phải được TikTok duyệt. Trước khi duyệt,
 *      ứng dụng chỉ đăng được ở chế độ riêng tư (SELF_ONLY).
 *   2. Scope `video.upload` (đẩy vào mục nháp) dễ được duyệt hơn nhiều — đây là
 *      lý do chế độ `inbox` được đặt làm mặc định.
 */
class TikTokClient
{
    private const AUTH_URL  = 'https://www.tiktok.com/v2/auth/authorize/';
    private const API_BASE  = 'https://open.tiktokapis.com/v2';
    private const TIMEOUT   = 60;

    public function __construct(
        private ?string $clientKey = null,
        private ?string $clientSecret = null,
        private ?string $redirectUri = null,
    ) {
        // Khoá lấy từ bảng settings trước (sửa được trên web), .env là dự phòng.
        $this->clientKey    ??= Setting::get('tiktok.client_key');
        $this->clientSecret ??= Setting::get('tiktok.client_secret');
        $this->redirectUri  ??= Setting::get('tiktok.redirect_uri');
    }

    public function isConfigured(): bool
    {
        return filled($this->clientKey) && filled($this->clientSecret) && filled($this->redirectUri);
    }

    // ───────────────────────────────────────────────────────────── OAuth

    /** Link đưa người dùng sang TikTok để cấp quyền. */
    public function authorizeUrl(string $state, array $scopes): string
    {
        return self::AUTH_URL.'?'.http_build_query([
            'client_key'    => $this->clientKey,
            'scope'         => implode(',', $scopes),
            'response_type' => 'code',
            'redirect_uri'  => $this->redirectUri,
            'state'         => $state,
        ]);
    }

    /** Đổi mã uỷ quyền lấy access token. */
    public function exchangeCode(string $code): array
    {
        return $this->token([
            'code'         => $code,
            'grant_type'   => 'authorization_code',
            'redirect_uri' => $this->redirectUri,
        ]);
    }

    public function refresh(string $refreshToken): array
    {
        return $this->token([
            'grant_type'    => 'refresh_token',
            'refresh_token' => $refreshToken,
        ]);
    }

    private function token(array $payload): array
    {
        // KHÔNG thêm tay header Content-Type ở đây: asForm() đã đặt sẵn, khai lại
        // làm header bị gửi HAI lần, và TikTok từ chối với đúng câu
        // "Only `application/x-www-form-urlencoded` is accepted as Content-Type".
        // Hệ quả là mọi lần làm mới token đều thất bại, tức đăng bài chết sau 24
        // tiếng kể từ lúc kết nối kênh.
        $response = Http::asForm()
            ->timeout(self::TIMEOUT)
            ->post(self::API_BASE.'/oauth/token/', array_merge([
                'client_key'    => $this->clientKey,
                'client_secret' => $this->clientSecret,
            ], $payload));

        $data = $response->json() ?? [];

        // Endpoint token báo lỗi ở cấp cao nhất, khác với các endpoint còn lại.
        if (isset($data['error']) && $data['error'] !== '') {
            throw new RuntimeException(
                'TikTok OAuth: '.($data['error_description'] ?? $data['error'])
            );
        }
        if (! $response->successful() || ! isset($data['access_token'])) {
            throw new RuntimeException('TikTok OAuth thất bại: '.$response->body());
        }

        return $data;
    }

    /**
     * Đảm bảo token còn hiệu lực, tự làm mới nếu sắp hết hạn.
     * Trả về access token dùng được ngay.
     */
    public function freshToken(TiktokAccount $account): string
    {
        $stillValid = $account->access_expires_at
            && $account->access_expires_at->isAfter(now()->addMinutes(5));

        if ($stillValid) {
            return $account->access_token;
        }

        if (! $account->refresh_token || $account->refresh_expired) {
            throw new RuntimeException(
                'Token đã hết hạn và không làm mới được — hãy kết nối lại tài khoản TikTok.'
            );
        }

        $data = $this->refresh($account->refresh_token);
        $account->update([
            'access_token'       => $data['access_token'],
            'refresh_token'      => $data['refresh_token'] ?? $account->refresh_token,
            'access_expires_at'  => now()->addSeconds((int) ($data['expires_in'] ?? 86400)),
            'refresh_expires_at' => now()->addSeconds((int) ($data['refresh_expires_in'] ?? 31536000)),
        ]);

        return $account->fresh()->access_token;
    }

    // ────────────────────────────────────────────────────────── API calls

    public function userInfo(string $accessToken): array
    {
        $response = Http::withToken($accessToken)
            ->timeout(self::TIMEOUT)
            ->get(self::API_BASE.'/user/info/', [
                'fields' => 'open_id,union_id,avatar_url,display_name',
            ]);

        return $this->unwrap($response)['user'] ?? [];
    }

    /**
     * TikTok bắt buộc gọi creator_info trước mỗi lần đăng thẳng: nó trả về các
     * mức riêng tư tài khoản được phép chọn và trạng thái khoá đăng bài.
     */
    public function creatorInfo(string $accessToken): array
    {
        $response = Http::withToken($accessToken)
            ->timeout(self::TIMEOUT)
            ->post(self::API_BASE.'/post/publish/creator_info/query/');

        return $this->unwrap($response);
    }

    /** Khởi tạo phiên đăng. Trả về publish_id và upload_url. */
    public function initUpload(string $accessToken, array $payload, string $mode): array
    {
        $endpoint = $mode === 'direct_post'
            ? '/post/publish/video/init/'
            : '/post/publish/inbox/video/init/';

        $response = Http::withToken($accessToken)
            ->timeout(self::TIMEOUT)
            ->asJson()
            ->post(self::API_BASE.$endpoint, $payload);

        return $this->unwrap($response);
    }

    /**
     * Tải file video lên địa chỉ TikTok cấp.
     *
     * Video của dây chuyền này khoảng 15–20 MB nên gửi trọn một lần. TikTok cho
     * phép một khối tới 64 MB; vượt mức đó phải chia khối, và khi ấy `initUpload`
     * cũng phải khai đúng total_chunk_count.
     */
    public function uploadFile(string $uploadUrl, string $path): void
    {
        $size = filesize($path);
        if ($size === false || $size === 0) {
            throw new RuntimeException("Không đọc được file video: {$path}");
        }

        $response = Http::withHeaders([
                'Content-Type'   => 'video/mp4',
                'Content-Length' => (string) $size,
                'Content-Range'  => sprintf('bytes 0-%d/%d', $size - 1, $size),
            ])
            ->timeout(600)
            ->withBody(file_get_contents($path), 'video/mp4')
            ->put($uploadUrl);

        if (! $response->successful()) {
            throw new RuntimeException(
                "Tải video lên TikTok thất bại (HTTP {$response->status()}): ".$response->body()
            );
        }
    }

    /** Hỏi TikTok xem video đã xử lý xong chưa. */
    public function publishStatus(string $accessToken, string $publishId): array
    {
        $response = Http::withToken($accessToken)
            ->timeout(self::TIMEOUT)
            ->asJson()
            ->post(self::API_BASE.'/post/publish/status/fetch/', ['publish_id' => $publishId]);

        return $this->unwrap($response);
    }

    /**
     * API v2 luôn trả về {data: ..., error: {code: "ok"|..., message}}.
     * HTTP 200 không có nghĩa là thành công — phải đọc error.code.
     */
    private function unwrap(Response $response): array
    {
        $body  = $response->json() ?? [];
        $error = $body['error'] ?? [];
        $code  = $error['code'] ?? null;

        if ($code !== null && $code !== 'ok') {
            $message = $error['message'] ?? 'lỗi không rõ';
            $logId   = $error['log_id'] ?? '';
            throw new RuntimeException(trim("TikTok [{$code}] {$message} {$logId}"));
        }

        if (! $response->successful()) {
            throw new RuntimeException("TikTok HTTP {$response->status()}: ".$response->body());
        }

        return $body['data'] ?? [];
    }
}
