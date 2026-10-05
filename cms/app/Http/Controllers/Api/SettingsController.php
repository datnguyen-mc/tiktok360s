<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use App\Services\TikTok\TikTokClient;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    private const KEYS = [
        'tiktok' => ['tiktok.client_key', 'tiktok.client_secret', 'tiktok.redirect_uri', 'tiktok.post_mode'],
        'google' => ['google.client_id', 'google.client_secret', 'google.redirect_uri', 'google.allowed_domain'],
        // Gemini viết kịch bản cho kênh phim nhiều tập. Cùng một khoá Google AI
        // Studio dùng được cho cả Veo, nên để trống thì hệ thống tự mượn khoá
        // của engine Veo đang bật.
        'gemini' => ['gemini.api_key', 'gemini.model'],
        'openai' => ['openai.api_key', 'openai.model'],
        // Cloudflare R2: nơi chứa video sau khi dựng. Thiếu khoá thì dây chuyền
        // bỏ qua bước tải lên và video vẫn nằm trong output/ như cũ.
        'r2' => ['r2.enabled', 'r2.bucket', 'r2.endpoint', 'r2.public_url',
                 'r2.prefix', 'r2.access_key_id', 'r2.secret_access_key'],
    ];

    public function index()
    {
        $all = array_merge(...array_values(self::KEYS));

        return response()->json([
            'values'   => Setting::forDisplay($all),
            'tiktok_ready' => (new TikTokClient())->isConfigured(),
            'callback' => [
                'tiktok' => url('/tiktok/callback'),
                'google' => url('/auth/google/callback'),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'tiktok.client_key'     => ['nullable', 'string', 'max:255'],
            'tiktok.client_secret'  => ['nullable', 'string', 'max:255'],
            'tiktok.redirect_uri'   => ['nullable', 'url', 'max:500'],
            'tiktok.post_mode'      => ['nullable', 'in:inbox,direct_post'],
            'google.client_id'      => ['nullable', 'string', 'max:255'],
            'google.client_secret'  => ['nullable', 'string', 'max:255'],
            'google.redirect_uri'   => ['nullable', 'url', 'max:500'],
            'google.allowed_domain' => ['nullable', 'string', 'max:120'],
            'gemini.api_key'        => ['nullable', 'string', 'max:255'],
            'openai.api_key'        => ['nullable', 'string', 'max:255'],
            'openai.model'          => ['nullable', 'string', 'max:80'],
            'gemini.model'          => ['nullable', 'string', 'max:60'],
            'r2.enabled'            => ['nullable', 'boolean'],
            'r2.bucket'             => ['nullable', 'string', 'max:120'],
            'r2.endpoint'           => ['nullable', 'string', 'max:300'],
            'r2.public_url'         => ['nullable', 'string', 'max:300'],
            'r2.prefix'             => ['nullable', 'string', 'max:120'],
            'r2.access_key_id'      => ['nullable', 'string', 'max:255'],
            'r2.secret_access_key'  => ['nullable', 'string', 'max:255'],
        ]);

        foreach (self::KEYS as $group => $keys) {
            foreach ($keys as $key) {
                $value = data_get($data, $key);

                // Ô bí mật hiện dấu chấm — bỏ qua để không ghi đè bằng chuỗi giả.
                // Chuỗi RỖNG cũng bỏ qua nếu đây là khoá bí mật: biểu mẫu gửi ô
                // trống không có nghĩa là "xoá khoá đi", mà thường chỉ là người
                // dùng không đụng vào ô đó.
                if ($value === null || $value === '••••••••') {
                    continue;
                }
                if ($value === '' && in_array($key, Setting::SECRETS, true)) {
                    continue;
                }
                Setting::put($key, $value, $group);
            }
        }

        ActivityLog::write('settings.updated', 'Cập nhật cấu hình khoá API', 'info');

        return $this->index();
    }
}
