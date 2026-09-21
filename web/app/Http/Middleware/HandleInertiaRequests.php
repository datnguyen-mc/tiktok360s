<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\Page;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),

            'auth' => [
                // `initial` và `is_admin` tính sẵn ở đây để mọi trang dùng chung,
                // khỏi lặp lại logic ở từng component Vue.
                'user' => $request->user() ? [
                    ...$request->user()->only(['id', 'name', 'email', 'username', 'avatar_url', 'bio']),
                    'initial'  => mb_strtoupper(mb_substr($request->user()->name, 0, 1)),
                    'is_admin' => $request->user()->isAdmin(),
                    // Giao diện ẩn đúng những gì máy chủ cũng chặn, để người
                    // dùng không bấm vào thứ chắc chắn trả về 403.
                    'can'      => array_fill_keys($request->user()->permissions(), true),
                    'verified' => $request->user()->email_verified_at !== null,
                    'role'       => $request->user()->role,
                    'role_label' => \App\Support\Roles::label($request->user()->role),
                ] : null,
            ],

            // Cấu hình do quản trị viên đặt (AppServiceProvider đã đổ đè lên
            // config), cộng thông tin liên hệ và mạng xã hội cho chân trang.
            'site' => fn () => array_merge(SiteSetting::values(), [
                'ga' => config('site.google_analytics_id'),
            ]),

            // Trang tĩnh hiện ở chân trang
            'footerPages' => fn () => Page::published()->where('in_footer', true)
                ->orderBy('sort')->orderBy('id')
                ->get(['slug', 'title'])->all(),

            // Menu chuyên mục có mặt trên mọi trang. Dùng closure để Inertia chỉ
            // truy vấn khi thật sự cần (điều hướng một phần thì bỏ qua).
            'menu' => fn () => Category::active()
                ->where('in_menu', true)
                ->get(['slug', 'name', 'color'])
                ->all(),

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
