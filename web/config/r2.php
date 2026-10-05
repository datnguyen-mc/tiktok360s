<?php

/*
 * Cấu hình Cloudflare R2.
 *
 * Để riêng một file thay vì gọi env() thẳng trong lớp R2: `php artisan config:cache`
 * khiến env() trả về null, nên mọi giá trị phải đi qua config().
 */
return [
    'bucket' => env('AWS_BUCKET', ''),
    'endpoint' => env('AWS_ENDPOINT', ''),
    'key' => env('AWS_ACCESS_KEY_ID', ''),
    'secret' => env('AWS_SECRET_ACCESS_KEY', ''),
    'region' => env('AWS_DEFAULT_REGION', 'auto'),

    // Tên miền đọc công khai (r2.dev hoặc domain riêng). Bỏ trống thì ảnh nhúng
    // bằng thẻ <img> sẽ hỏng, vì địa chỉ endpoint cần chữ ký mới mở được.
    'public_url' => env('AWS_PUBLIC_URL', ''),
];
