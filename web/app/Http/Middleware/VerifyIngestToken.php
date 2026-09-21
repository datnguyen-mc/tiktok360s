<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Cho phép dây chuyền Python đẩy tin bằng khoá tĩnh thay vì phiên đăng nhập. */
class VerifyIngestToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $expected = (string) env('INGEST_TOKEN', '');
        $given = (string) $request->header('X-Ingest-Token', '');

        abort_if($expected === '', 500, 'Chưa đặt INGEST_TOKEN trong .env');
        abort_unless(hash_equals($expected, $given), 401, 'Khoá nạp dữ liệu không đúng');

        return $next($request);
    }
}
