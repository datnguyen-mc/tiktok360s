<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        /*
         | Ghi mọi action vào nhật ký. API của CMS chạy trong nhóm `web` (dùng
         | chung phiên đăng nhập với SPA), nên ghi ở đây là bắt được tất cả.
         |
         | PREPEND chứ không append: `SubstituteBindings` nằm trong nhóm này và
         | ném 404 khi không tìm thấy bản ghi. Đặt sau nó thì exception văng ra
         | trước khi tới lượt ghi log, và mọi lỗi 404 biến mất khỏi nhật ký.
         */
        $middleware->web(prepend: [\App\Http\Middleware\LogActivity::class]);
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
