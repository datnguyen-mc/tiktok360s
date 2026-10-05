<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Đẩy file lên Cloudflare R2.
 *
 * Không dùng AWS SDK: bộ đó kéo theo vài chục gói chỉ để gửi một lệnh PUT, mà
 * thứ R2 cần chỉ là chữ ký SigV4 kiểu path-style — gọn trong một file.
 *
 * Nguyên tắc như `pipeline/r2.py`: hạ tầng phụ hỏng thì công việc chính vẫn
 * phải chạy. Mọi hàm ở đây nuốt lỗi và trả về null, không bao giờ ném ra ngoài;
 * lấy tin về mà không gương được ảnh thì bài vẫn phải được lưu.
 */
class R2
{
    private const ALGO = 'AWS4-HMAC-SHA256';
    private const SERVICE = 's3';

    /** Ảnh lớn hơn mức này bỏ qua — gần như chắc chắn là file lỗi hoặc không phải ảnh. */
    private const MAX_BYTES = 12 * 1024 * 1024;

    private string $bucket;
    private string $endpoint;
    private string $key;
    private string $secret;
    private string $region;
    private string $publicUrl;

    public function __construct()
    {
        $this->bucket = (string) config('r2.bucket');
        $this->endpoint = rtrim((string) config('r2.endpoint'), '/');
        $this->key = (string) config('r2.key');
        $this->secret = (string) config('r2.secret');
        $this->region = (string) config('r2.region') ?: 'auto';
        $this->publicUrl = rtrim((string) config('r2.public_url'), '/');
    }

    public function ready(): bool
    {
        return $this->bucket !== '' && $this->endpoint !== ''
            && $this->key !== '' && $this->secret !== '';
    }

    /** Thiếu những gì — để lệnh gọi báo cho người dùng biết phải điền ô nào. */
    public function missing(): array
    {
        return array_keys(array_filter([
            'AWS_BUCKET' => $this->bucket === '',
            'AWS_ENDPOINT' => $this->endpoint === '',
            'AWS_ACCESS_KEY_ID' => $this->key === '',
            'AWS_SECRET_ACCESS_KEY' => $this->secret === '',
        ]));
    }

    /**
     * Địa chỉ đọc file.
     *
     * Chưa khai tên miền công khai thì trả về địa chỉ endpoint — địa chỉ đó chỉ
     * mở được khi kèm chữ ký, nên thẻ <img> sẽ hỏng. Gọi ready() và hasPublicUrl()
     * trước khi dùng cho ảnh nhúng.
     */
    public function url(string $key): string
    {
        $base = $this->publicUrl ?: "{$this->endpoint}/{$this->bucket}";

        return $base.'/'.$this->encodePath($key);
    }

    public function hasPublicUrl(): bool
    {
        return $this->publicUrl !== '';
    }

    /** Địa chỉ này đã nằm trên R2 của mình chưa — để khỏi gương lại lần hai. */
    public function owns(?string $url): bool
    {
        if (! $url) {
            return false;
        }
        foreach ([$this->publicUrl, $this->endpoint] as $base) {
            if ($base !== '' && str_starts_with($url, $base)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Tải ảnh từ địa chỉ ngoài rồi đẩy lên R2. Trả về địa chỉ mới, hoặc null.
     *
     * Khoá đặt theo sha1 của địa chỉ gốc nên chạy lại nhiều lần vẫn ra đúng một
     * file, không sinh bản trùng. Chia thư mục theo hai ký tự đầu để một thư mục
     * không phình ra hàng vạn file.
     */
    public function mirror(string $url, string $prefix = 'anh'): ?string
    {
        if (! $this->ready() || $this->owns($url)) {
            return null;
        }

        try {
            // Nhiều CDN báo chí chặn yêu cầu không có User-Agent hoặc Referer.
            $resp = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (compatible; tiktok360s/1.0)',
                'Referer' => $this->origin($url),
            ])->timeout(20)->get($url);
        } catch (\Throwable $e) {
            Log::warning('R2: không tải được ảnh', ['url' => $url, 'loi' => $e->getMessage()]);

            return null;
        }

        if (! $resp->successful()) {
            Log::warning('R2: ảnh trả về HTTP '.$resp->status(), ['url' => $url]);

            return null;
        }

        $body = $resp->body();
        $type = strtok((string) $resp->header('Content-Type'), ';') ?: '';
        if ($body === '' || strlen($body) > self::MAX_BYTES || ! str_starts_with($type, 'image/')) {
            Log::warning('R2: bỏ qua, không phải ảnh dùng được', [
                'url' => $url, 'type' => $type, 'bytes' => strlen($body),
            ]);

            return null;
        }

        $bam = sha1($url);
        $key = sprintf('%s/%s/%s.%s', trim($prefix, '/'), substr($bam, 0, 2), $bam, $this->ext($type));

        return $this->put($key, $body, $type);
    }

    /** PUT thẳng một chuỗi byte. Trả về địa chỉ đọc, hoặc null nếu hỏng. */
    public function put(string $key, string $body, string $contentType): ?string
    {
        if (! $this->ready()) {
            return null;
        }

        $uri = '/'.$this->bucket.'/'.$this->encodePath($key);

        // withBody() tự đặt Content-Type. Nếu truyền thêm qua withHeaders() thì
        // Guzzle gửi header đó HAI lần, mà SigV4 quy định header lặp phải gộp
        // thành "text/plain,text/plain" khi tính chữ ký — lệch với chữ ký đã ký
        // trên một giá trị, và R2 trả về SignatureDoesNotMatch.
        $headers = $this->authHeaders('PUT', $uri, $body, $contentType);
        unset($headers['content-type']);

        try {
            $resp = Http::withHeaders($headers)
                ->withBody($body, $contentType)
                ->timeout(60)
                ->put($this->endpoint.$uri);
        } catch (\Throwable $e) {
            Log::warning('R2: không đẩy lên được', ['key' => $key, 'loi' => $e->getMessage()]);

            return null;
        }

        if (! $resp->successful()) {
            Log::warning('R2: PUT trả về HTTP '.$resp->status(), [
                'key' => $key, 'than' => substr($resp->body(), 0, 200),
            ]);

            return null;
        }

        return $this->url($key);
    }

    // ------------------------------------------------------------- chữ ký

    /**
     * Bộ header đã ký cho một yêu cầu S3 kiểu path-style.
     *
     * Header ký phải viết thường và xếp theo thứ tự chữ cái — chuẩn SigV4 bắt
     * như vậy, sai thứ tự là R2 trả về 403 mà không nói vì sao.
     */
    private function authHeaders(string $method, string $uri, string $body, string $contentType): array
    {
        $now = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
        $amzdate = $now->format('Ymd\THis\Z');
        $stamp = $now->format('Ymd');
        $hash = hash('sha256', $body);

        $signed = [
            'content-type' => $contentType,
            'host' => parse_url($this->endpoint, PHP_URL_HOST),
            'x-amz-content-sha256' => $hash,
            'x-amz-date' => $amzdate,
        ];
        ksort($signed);

        $canonicalHeaders = '';
        foreach ($signed as $k => $v) {
            $canonicalHeaders .= "{$k}:{$v}\n";
        }
        $signedHeaders = implode(';', array_keys($signed));

        $canonical = implode("\n", [$method, $uri, '', $canonicalHeaders, $signedHeaders, $hash]);
        $scope = "{$stamp}/{$this->region}/".self::SERVICE.'/aws4_request';
        $toSign = implode("\n", [self::ALGO, $amzdate, $scope, hash('sha256', $canonical)]);

        $k = hash_hmac('sha256', $stamp, 'AWS4'.$this->secret, true);
        $k = hash_hmac('sha256', $this->region, $k, true);
        $k = hash_hmac('sha256', self::SERVICE, $k, true);
        $k = hash_hmac('sha256', 'aws4_request', $k, true);
        $sig = hash_hmac('sha256', $toSign, $k);

        unset($signed['host']);          // Laravel tự đặt Host theo địa chỉ gọi

        return $signed + [
            'Authorization' => self::ALGO." Credential={$this->key}/{$scope}, "
                ."SignedHeaders={$signedHeaders}, Signature={$sig}",
        ];
    }

    /** Mã hoá từng đoạn đường dẫn, giữ nguyên dấu '/' phân cách. */
    private function encodePath(string $key): string
    {
        return implode('/', array_map('rawurlencode', explode('/', $key)));
    }

    private function ext(string $contentType): string
    {
        return match ($contentType) {
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            'image/avif' => 'avif',
            'image/svg+xml' => 'svg',
            default => 'jpg',
        };
    }

    private function origin(string $url): string
    {
        $p = parse_url($url);

        return ($p['scheme'] ?? 'https').'://'.($p['host'] ?? '').'/';
    }
}
