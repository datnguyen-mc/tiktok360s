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
        ]);

        foreach (self::KEYS as $group => $keys) {
            foreach ($keys as $key) {
                $value = data_get($data, $key);
                // Ô bí mật hiện dấu chấm — bỏ qua để không ghi đè bằng chuỗi giả.
                if ($value === null || $value === '••••••••') {
                    continue;
                }
                Setting::put($key, $value, $group);
            }
        }

        ActivityLog::write('settings.updated', 'Cập nhật cấu hình khoá API', 'info');

        return $this->index();
    }
}
