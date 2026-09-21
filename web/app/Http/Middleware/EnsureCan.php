<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Chặn theo *quyền*, không theo vai trò.
 *
 * Gác bằng vai trò thì mỗi lần thêm vai trò mới lại phải đi sửa từng route;
 * gác bằng quyền thì chỉ cần tích thêm một ô trong trang Vai trò.
 *
 *   Route::delete(...)->middleware('can.do:users.manage');
 */
class EnsureCan
{
    public function handle(Request $request, Closure $next, string $ability): Response
    {
        abort_unless($request->user()?->hasPermission($ability), 403,
            'Tài khoản của bạn không có quyền thực hiện việc này.');

        return $next($request);
    }
}
