<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;

/**
 * Cấu hình Cloudflare R2 cho dây chuyền.
 *
 * Dây chuyền hỏi đây thay vì đọc file: khoá khai trong CMS thì phải tới được
 * dây chuyền, không bắt người dùng vừa điền trong giao diện vừa sửa cms/.env.
 *
 * Bảo vệ bằng khoá nạp dữ liệu, giống các endpoint pipeline khác.
 */
class R2Controller extends Controller
{
    public function __invoke()
    {
        $bat = filter_var(Setting::get('r2.enabled'), FILTER_VALIDATE_BOOLEAN);

        return response()->json([
            'enabled'    => $bat,
            'bucket'     => Setting::get('r2.bucket') ?: '',
            'endpoint'   => rtrim((string) Setting::get('r2.endpoint'), '/'),
            'public_url' => rtrim((string) Setting::get('r2.public_url'), '/'),
            'prefix'     => Setting::get('r2.prefix') ?: 'videos',
            'access_key' => Setting::get('r2.access_key_id') ?: '',
            'secret_key' => Setting::get('r2.secret_access_key') ?: '',
        ]);
    }
}
