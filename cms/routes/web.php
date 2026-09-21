<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\ChannelController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CreateVideoController;
use App\Http\Controllers\Api\RegenerateVideoController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\IngestController;
use App\Http\Controllers\Api\PipelineConfigController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\PromptPresetController;
use App\Http\Controllers\Api\PublishJobController;
use App\Http\Controllers\Api\RunController;
use App\Http\Controllers\Api\TopicController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\StepController;
use App\Http\Controllers\Api\TwoFactorController;
use App\Http\Controllers\Api\VideoEngineController;
use App\Http\Controllers\MetricsController;
use App\Http\Controllers\Web\GoogleAuthController;
use App\Http\Controllers\Web\TiktokAuthController;
use App\Http\Middleware\VerifyIngestToken;
use Illuminate\Support\Facades\Route;

/*
 | API chạy trong nhóm middleware `web` để dùng chung phiên đăng nhập với SPA
 | (cùng tên miền nên không cần Sanctum token). Laravel tự kiểm CSRF qua cookie
 | XSRF-TOKEN mà axios gửi kèm.
 */
Route::prefix('api')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->name('login');
    Route::post('login/two-factor', [AuthController::class, 'twoFactorChallenge']);
    Route::get('auth/status', [AuthController::class, 'status']);

    // Script Python nạp dữ liệu — xác thực bằng khoá, không cần đăng nhập.
    // Dây chuyền Python đọc cấu hình sinh cảnh (cùng khoá với đường nạp dữ liệu)
    Route::get('pipeline/config', PipelineConfigController::class)
        ->middleware(VerifyIngestToken::class);

    Route::post('ingest/step', [StepController::class, 'store'])
        ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class])
        ->middleware(VerifyIngestToken::class);

    Route::post('ingest/run', [IngestController::class, 'store'])
        ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class])
        ->middleware(VerifyIngestToken::class);

    Route::middleware('auth')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);

        Route::get('dashboard', DashboardController::class);

        // Chủ đề kênh — đọc/ghi thẳng các file topics/*.json của dây chuyền
        Route::get('topics', [TopicController::class, 'index']);
        Route::post('topics', [TopicController::class, 'store']);
        Route::get('topics/{slug}', [TopicController::class, 'show']);
        Route::put('topics/{slug}', [TopicController::class, 'update']);
        Route::delete('topics/{slug}', [TopicController::class, 'destroy']);

        // Bấm "Tạo video" ở trang Video
        Route::post('videos/create', CreateVideoController::class);

        // Thư viện prompt
        Route::get('prompt-presets', [PromptPresetController::class, 'index']);
        Route::post('prompt-presets', [PromptPresetController::class, 'store']);
        Route::put('prompt-presets/{preset}', [PromptPresetController::class, 'update']);
        Route::delete('prompt-presets/{preset}', [PromptPresetController::class, 'destroy']);
        Route::post('prompt-presets/preview', [PromptPresetController::class, 'preview']);

        Route::get('runs', [RunController::class, 'index']);
        Route::get('runs/{run}', [RunController::class, 'show']);
        Route::delete('runs/{run}', [RunController::class, 'destroy']);
        Route::get('runs/{run}/video', [RunController::class, 'video']);
        Route::get('runs/{run}/thumbnail', [RunController::class, 'thumbnail']);
        // Bấm "Tạo lại" trên một video đã có
        Route::post('runs/{run}/regenerate', RegenerateVideoController::class);

        Route::get('publish-jobs', [PublishJobController::class, 'index']);
        Route::post('publish-jobs', [PublishJobController::class, 'store']);
        Route::post('publish-jobs/{job}/retry', [PublishJobController::class, 'retry']);
        Route::post('publish-jobs/{job}/sync', [PublishJobController::class, 'sync']);
        Route::delete('publish-jobs/{job}', [PublishJobController::class, 'destroy']);

        Route::get('tiktok-accounts', [PublishJobController::class, 'accounts']);
        Route::delete('tiktok-accounts/{account}', [TiktokAuthController::class, 'disconnect']);

        Route::get('activity-logs', [ActivityLogController::class, 'index']);

        // Kênh TikTok
        Route::get('channels', [ChannelController::class, 'index']);
        Route::put('channels/{account}', [ChannelController::class, 'update']);
        Route::post('channels/preview-prompt', [ChannelController::class, 'previewPrompt']);

        // Engine tạo video
        Route::get('video-engines', [VideoEngineController::class, 'index']);
        Route::post('video-engines', [VideoEngineController::class, 'store']);
        Route::put('video-engines/{engine}', [VideoEngineController::class, 'update']);
        Route::delete('video-engines/{engine}', [VideoEngineController::class, 'destroy']);
        Route::post('video-engines/{engine}/trigger', [VideoEngineController::class, 'trigger']);
        Route::post('video-engines/estimate', [VideoEngineController::class, 'estimate']);

        // Cấu hình khoá API
        Route::get('settings', [SettingsController::class, 'index']);
        Route::put('settings', [SettingsController::class, 'update']);

        // Thông tin tài khoản
        Route::put('profile', [ProfileController::class, 'update']);
        Route::post('profile/password', [ProfileController::class, 'changePassword']);
        Route::post('profile/unlink-google', [ProfileController::class, 'unlinkGoogle']);

        // Xác thực hai lớp
        Route::post('two-factor/enroll', [TwoFactorController::class, 'enroll']);
        Route::post('two-factor/confirm', [TwoFactorController::class, 'confirm']);
        Route::post('two-factor/disable', [TwoFactorController::class, 'disable']);
        Route::post('two-factor/recovery-codes', [TwoFactorController::class, 'recoveryCodes']);
    });
});

// Số liệu cho Prometheus. Không cần đăng nhập vì chỉ chứa số đếm, không có dữ
// liệu nhạy cảm — nhưng ở máy chủ thật nên chặn đường này ở tầng ingress,
// chỉ cho Prometheus trong cụm gọi (xem deploy/k8s/80-monitoring.yaml).
Route::get('metrics', MetricsController::class);

// OAuth phải là route trình duyệt, không phải API.
Route::middleware('auth')->group(function () {
    Route::get('tiktok/connect', [TiktokAuthController::class, 'redirect'])->name('tiktok.connect');
});
Route::get('tiktok/callback', [TiktokAuthController::class, 'callback'])->name('tiktok.callback');

// Đăng nhập Google (phải là route trình duyệt vì có chuyển hướng)
Route::get('auth/google/redirect', [GoogleAuthController::class, 'redirect']);
Route::get('auth/google/callback', [GoogleAuthController::class, 'callback']);

// Mọi đường dẫn còn lại trả về SPA; vue-router lo phần định tuyến phía trình duyệt.
Route::get('/{any?}', fn () => view('app'))->where('any', '^(?!api|tiktok|auth|metrics|up).*$');
