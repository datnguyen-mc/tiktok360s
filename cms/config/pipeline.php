<?php

return [
    // Thư mục gốc của dây chuyền Python — CMS đọc file video và ảnh bìa từ đây.
    'root' => env('PIPELINE_ROOT', base_path('..')),

    // Khoá để script Python gọi API nạp dữ liệu.
    'ingest_token' => env('INGEST_TOKEN', ''),
];
