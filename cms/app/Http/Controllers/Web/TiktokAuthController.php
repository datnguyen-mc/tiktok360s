<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\TiktokAccount;
use App\Services\TikTok\TikTokClient;
use Illuminate\Http\Request;
use Throwable;

/**
 * Luồng OAuth của TikTok. Phải là route web (không phải API) vì người dùng được
 * chuyển hướng sang TikTok rồi quay lại bằng trình duyệt.
 */
class TiktokAuthController extends Controller
{
    public function __construct(private TikTokClient $client) {}

    public function redirect(Request $request)
    {
        if (! $this->client->isConfigured()) {
            return redirect('/accounts?error='.urlencode(
                'Chưa điền TIKTOK_CLIENT_KEY / SECRET / REDIRECT_URI trong .env'
            ));
        }

        // state chống CSRF: TikTok trả lại nguyên vẹn, ta đối chiếu với session.
        $state = bin2hex(random_bytes(16));
        $request->session()->put('tiktok_state', $state);

        $scopes = ['user.info.basic', 'video.upload'];
        if (config('services.tiktok.post_mode') === 'direct_post') {
            $scopes[] = 'video.publish';
        }

        return redirect()->away($this->client->authorizeUrl($state, $scopes));
    }

    public function callback(Request $request)
    {
        $expected = $request->session()->pull('tiktok_state');

        if ($request->filled('error')) {
            return $this->back($request->string('error_description')->toString()
                ?: $request->string('error')->toString());
        }
        if (! $expected || ! hash_equals($expected, $request->string('state')->toString())) {
            return $this->back('State không khớp — thử kết nối lại từ đầu.');
        }
        if (! $request->filled('code')) {
            return $this->back('TikTok không trả về mã uỷ quyền.');
        }

        try {
            $token = $this->client->exchangeCode($request->string('code')->toString());
            $user  = $this->client->userInfo($token['access_token']);

            $account = TiktokAccount::updateOrCreate(
                ['open_id' => $token['open_id'] ?? ($user['open_id'] ?? 'unknown')],
                [
                    'union_id'           => $user['union_id'] ?? null,
                    'display_name'       => $user['display_name'] ?? null,
                    'avatar_url'         => $user['avatar_url'] ?? null,
                    'access_token'       => $token['access_token'],
                    'refresh_token'      => $token['refresh_token'] ?? null,
                    'access_expires_at'  => now()->addSeconds((int) ($token['expires_in'] ?? 86400)),
                    'refresh_expires_at' => now()->addSeconds((int) ($token['refresh_expires_in'] ?? 31536000)),
                    'scopes'             => $token['scope'] ?? null,
                    'is_active'          => true,
                ]
            );

            ActivityLog::write('tiktok.connected',
                'Đã kết nối tài khoản '.($account->display_name ?: $account->open_id),
                'info', $account);

            return redirect('/accounts?connected=1');
        } catch (Throwable $e) {
            ActivityLog::write('tiktok.connect_failed', $e->getMessage(), 'error');

            return $this->back($e->getMessage());
        }
    }

    public function disconnect(TiktokAccount $account)
    {
        ActivityLog::write('tiktok.disconnected',
            'Đã ngắt tài khoản '.($account->display_name ?: $account->open_id), 'warning');
        $account->delete();

        return response()->json(['deleted' => true]);
    }

    private function back(string $message)
    {
        return redirect('/accounts?error='.urlencode($message));
    }
}
