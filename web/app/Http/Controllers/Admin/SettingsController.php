<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function edit()
    {
        return Inertia::render('Admin/Settings', [
            'settings' => SiteSetting::values(),
            'defaults' => SiteSetting::defaults(),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:60'],
            'tagline'     => ['nullable', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:300'],
            'logo'        => ['nullable', 'string', 'max:300'],
            'per_page'    => ['required', 'integer', 'min:6', 'max:60'],
            'ga'          => ['nullable', 'string', 'max:40'],
            'email'       => ['nullable', 'email', 'max:120'],
            'hotline'     => ['nullable', 'string', 'max:40'],
            'address'     => ['nullable', 'string', 'max:200'],
            'facebook'    => ['nullable', 'url', 'max:300'],
            'youtube'     => ['nullable', 'url', 'max:300'],
            'tiktok'      => ['nullable', 'url', 'max:300'],
            'copyright'   => ['nullable', 'string', 'max:200'],
        ], [], [
            'name' => 'tên website', 'per_page' => 'số bài mỗi trang',
        ]);

        SiteSetting::put($data);

        // Tên site và số bài mỗi trang nằm trong nội dung đã cache của trang chủ
        // và cột bên — không dọn thì phải chờ hết 5 phút mới thấy thay đổi.
        Cache::forget('home.v5');
        Cache::forget('sidebar.v1');

        return back()->with('success', 'Đã lưu cấu hình website');
    }
}
