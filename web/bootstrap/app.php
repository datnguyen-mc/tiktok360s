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
        // Bắt buộc: không có dòng này thì props dùng chung (site, menu, flash)
        // không bao giờ tới được lớp Vue, và trang sẽ thiếu logo lẫn menu.
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \App\Http\Middleware\TrackVisit::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // `can.do:<quyền>` — không dùng tên `can` vì Laravel đã giữ tên đó cho
        // middleware Gate dựa trên policy của model.
        $middleware->alias([
            'can.do' => \App\Http\Middleware\EnsureCan::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
