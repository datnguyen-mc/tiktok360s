<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Chỉ quản trị viên vào được khu /admin.
 *
 * Bảng users dùng chung với CMS video và website có đăng ký công khai, nên
 * `auth` KHÔNG đủ: một độc giả vừa đăng ký cũng đã qua được `auth`.
 */
class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->user()?->isAdmin(), 403,
            'Khu vực này chỉ dành cho quản trị viên.');

        return $next($request);
    }
}
