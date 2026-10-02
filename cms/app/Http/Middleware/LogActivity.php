<?php

namespace App\Http\Middleware;

use App\Models\ActivityLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

/**
 * Lưới an toàn cho nhật ký hoạt động.
 *
 * Controller tự ghi log bằng `ActivityLog::write()` với thông điệp tiếng Việt
 * dễ đọc — đó vẫn là cách tốt nhất. Nhưng dựa hoàn toàn vào đó thì mỗi lần thêm
 * endpoint mới mà quên ghi là action đó biến mất khỏi nhật ký, và không ai phát
 * hiện ra cho tới lúc cần truy.
 *
 * Middleware này ghi MỌI request có ghi dữ liệu mà controller chưa ghi, cộng
 * thêm mọi request trả về lỗi. Nhờ vậy nhật ký không bao giờ có lỗ hổng.
 */
class LogActivity
{
    /** Không ghi: nạp dữ liệu từ dây chuyền (đã có nhật ký riêng, rất ồn). */
    private const SKIP_PATHS = ['api/ingest/step', 'api/ingest/generation-call'];

    /** Giá trị của những khoá này bị thay bằng *** trước khi lưu. */
    private const SECRETS = [
        'password', 'password_confirmation', 'current_password', 'new_password',
        'token', 'api_key', 'secret', 'client_secret', 'access_token',
        'refresh_token', 'code', 'otp', 'two_factor_code', 'recovery_code',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        // Mỗi request một cờ riêng; tiến trình queue dùng lại tiến trình cũ nên
        // không đặt lại là dòng sau tưởng dòng trước đã ghi rồi.
        ActivityLog::$written = [];

        $t0 = microtime(true);

        try {
            $response = $next($request);
        } catch (\Throwable $e) {
            /*
             * Request ném exception thì `$next()` văng ra và mọi dòng phía sau
             * không bao giờ chạy — nghĩa là 404, 500, lỗi CSRF đều KHÔNG được
             * ghi, trong khi đó mới là những thứ cần soi nhất.
             *
             * Bắt lại, ghi, rồi ném tiếp nguyên vẹn để Laravel dựng trang lỗi
             * như thường.
             */
            $this->safely(fn () => $this->recordThrown($request, $e, $this->ms($t0)));

            throw $e;
        }

        $this->safely(fn () => $this->record($request, $response, $this->ms($t0)));

        return $response;
    }

    private function ms(float $t0): int
    {
        return (int) ((microtime(true) - $t0) * 1000);
    }

    /** Ghi log hỏng không được phép làm hỏng request. */
    private function safely(callable $fn): void
    {
        try {
            $fn();
        } catch (\Throwable) {
            // im lặng
        }
    }

    /** Ghi một request đã ném exception. */
    private function recordThrown(Request $request, \Throwable $e, int $ms): void
    {
        if (in_array($request->path(), self::SKIP_PATHS, true)) {
            return;
        }

        $status = $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;

        // Controller đã kịp ghi trước khi ném (ví dụ ghi "bắt đầu đăng bài" rồi
        // mới hỏng) — bổ sung vào dòng đó thay vì tạo dòng mới.
        if (ActivityLog::$written !== []) {
            ActivityLog::whereIn('id', ActivityLog::$written)
                ->update(['status' => $status, 'duration_ms' => $ms]);
        }

        // Exception HTTP mang sẵn mã (404, 403, 419…); còn lại là lỗi máy chủ
        $user = $request->user();

        ActivityLog::create([
            'level'       => $status >= 500 ? 'error' : 'warning',
            'event'       => $this->event($request, $status),
            'message'     => mb_substr(sprintf('%s /%s lỗi %d — %s',
                $request->method(), $request->path(), $status, $this->reason($e)), 0, 1000),
            'context'     => array_filter([
                'exception' => class_basename($e),
                'at'        => $this->where($e),
                'input'     => $this->redact($request->except(self::SECRETS)) ?: null,
            ]),
            'user_id'     => $user?->id,
            'actor'       => $user?->email,
            'ip'          => $request->ip(),
            'method'      => $request->method(),
            'path'        => mb_substr($request->path(), 0, 255),
            'status'      => $status,
            'duration_ms' => $ms,
        ]);
    }

    /** Thông điệp gọn cho người đọc, không phải nguyên vệt stack. */
    private function reason(\Throwable $e): string
    {
        $msg = trim($e->getMessage());

        return $msg !== '' ? mb_substr($msg, 0, 300) : class_basename($e);
    }

    private function where(\Throwable $e): string
    {
        return basename($e->getFile()).':'.$e->getLine();
    }

    private function record(Request $request, Response $response, int $ms): void
    {
        $status = $response->getStatusCode();
        $writes = ! $request->isMethod('GET') && ! $request->isMethod('HEAD');

        if (in_array($request->path(), self::SKIP_PATHS, true)) {
            return;
        }

        // Controller đã ghi dòng đẹp rồi thì chỉ bổ sung phần kỹ thuật vào đúng
        // những dòng đó, không ghi thêm dòng thứ hai trùng nội dung.
        if (ActivityLog::$written !== []) {
            ActivityLog::whereIn('id', ActivityLog::$written)
                ->update(['status' => $status, 'duration_ms' => $ms]);

            return;
        }

        // GET thành công thì bỏ qua — ghi mọi lần xem trang là nhật ký thành
        // một bãi rác không ai đọc nổi. GET mà lỗi thì vẫn ghi.
        if (! $writes && $status < 400) {
            return;
        }

        $user = $request->user();

        ActivityLog::create([
            'level'       => $this->level($status),
            'event'       => $this->event($request, $status),
            'message'     => $this->message($request, $status),
            'context'     => array_filter([
                'input' => $this->redact($request->except(self::SECRETS)) ?: null,
                'agent' => mb_substr((string) $request->userAgent(), 0, 200) ?: null,
            ]),
            'user_id'     => $user?->id,
            'actor'       => $user?->email,
            'ip'          => $request->ip(),
            'method'      => $request->method(),
            'path'        => mb_substr($request->path(), 0, 255),
            'status'      => $status,
            'duration_ms' => $ms,
        ]);
    }

    private function level(int $status): string
    {
        return match (true) {
            $status >= 500 => 'error',
            $status >= 400 => 'warning',
            default        => 'info',
        };
    }

    /** `api/video-engines/3` + PUT → `video-engines.updated` */
    private function event(Request $request, int $status): string
    {
        $parts = array_values(array_filter(
            explode('/', $request->path()),
            fn ($p) => $p !== 'api' && ! ctype_digit($p)
        ));

        $name = $parts[0] ?? 'http';
        $verb = match ($request->method()) {
            'POST'          => 'created',
            'PUT', 'PATCH'  => 'updated',
            'DELETE'        => 'deleted',
            default         => 'accessed',
        };

        return mb_substr($status >= 400 ? "{$name}.failed" : "{$name}.{$verb}", 0, 60);
    }

    private function message(Request $request, int $status): string
    {
        $who = $request->user()?->email ?? 'khách';

        return $status >= 400
            ? "{$request->method()} /{$request->path()} lỗi {$status} ({$who})"
            : "{$request->method()} /{$request->path()} ({$who})";
    }

    /** Che bí mật ở mọi tầng, kể cả trong mảng lồng nhau. */
    private function redact(array $data): array
    {
        foreach ($data as $key => $value) {
            if (in_array((string) $key, self::SECRETS, true)) {
                $data[$key] = '***';
            } elseif (is_array($value)) {
                $data[$key] = $this->redact($value);
            } elseif (is_string($value) && mb_strlen($value) > 500) {
                // Prompt và nội dung dài làm phình bảng; giữ đủ để nhận ra thôi
                $data[$key] = mb_substr($value, 0, 500).'… (cắt bớt)';
            }
        }

        return $data;
    }
}
