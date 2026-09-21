<?php

/*
 | Thông tin nhận diện và SEO. Gom một chỗ để thẻ meta, JSON-LD, sitemap và RSS
 | đều lấy từ cùng một nguồn — lệch nhau giữa các nơi là lỗi SEO khó thấy nhất.
 */

return [
    'name'     => env('SITE_NAME', 'Tin360s'),
    'tagline'  => env('SITE_TAGLINE', 'Tin tức tổng hợp mỗi ngày'),
    'locale'   => env('SITE_LOCALE', 'vi_VN'),
    'logo'     => env('SITE_LOGO', '/brand/logo.svg'),

    'google_site_verification' => env('GOOGLE_SITE_VERIFICATION'),
    'google_analytics_id'      => env('GOOGLE_ANALYTICS_ID'),

    // Số bài mỗi trang. Giữ vừa phải: trang quá dài làm chậm và loãng SEO.
    'per_page'      => 18,
    'feed_limit'    => 40,
    'sitemap_limit' => 5000,
];
