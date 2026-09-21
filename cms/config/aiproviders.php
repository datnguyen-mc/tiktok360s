<?php

/*
 | Thông số các model sinh video. Một nguồn duy nhất cho: danh sách model trong
 | giao diện, ước tính chi phí, và giá trị mặc định khi tạo engine.
 |
 | Giá lấy từ bảng giá công bố tháng 9/2026 — NHÀ CUNG CẤP CÓ THỂ ĐỔI BẤT CỨ LÚC NÀO.
 | Con số ở đây chỉ để ước tính trước khi chạy, không phải hoá đơn. Kiểm tra lại tại:
 |   Veo   https://ai.google.dev/gemini-api/docs/pricing
 |   Kling https://kling.ai/dev
 */

return [

    'veo' => [
        'label'     => 'Google Veo 3.1',
        'docs'      => 'https://ai.google.dev/gemini-api/docs/video',
        'key_label' => 'Gemini API key',
        'has_audio' => true,
        'durations' => [4, 6, 8],          // giây mỗi clip
        'aspects'   => ['9:16', '16:9'],
        'models'    => [
            'veo-3.1-generate-preview' => [
                'label'   => 'Veo 3.1 Standard — đẹp nhất, đắt nhất',
                'pricing' => ['720p' => 0.40, '1080p' => 0.40, '4k' => 0.60],
            ],
            'veo-3.1-fast-generate-preview' => [
                'label'   => 'Veo 3.1 Fast — cân bằng',
                'pricing' => ['720p' => 0.10, '1080p' => 0.12, '4k' => 0.30],
            ],
            'veo-3.1-lite-generate-preview' => [
                'label'   => 'Veo 3.1 Lite — rẻ nhất',
                'pricing' => ['720p' => 0.05, '1080p' => 0.08],
            ],
        ],
    ],

    'kling' => [
        'label'     => 'Kling AI',
        'docs'      => 'https://kling.ai/dev',
        'key_label' => 'Access Key + Secret Key',
        'has_audio' => false,
        'durations' => [5, 10],
        'aspects'   => ['9:16', '16:9', '1:1'],
        'modes'     => ['std', 'pro'],
        'models'    => [
            'kling-v2-master'  => ['label' => 'Kling 2.0 Master',  'pricing' => ['720p' => 0.10]],
            'kling-v2.5-turbo' => ['label' => 'Kling 2.5 Turbo',   'pricing' => ['720p' => 0.07]],
            'kling-v1-6'       => ['label' => 'Kling 1.6',          'pricing' => ['720p' => 0.05]],
            'kling-v1'         => ['label' => 'Kling 1.0 — rẻ nhất', 'pricing' => ['720p' => 0.03]],
        ],
    ],

];
