<?php

use Illuminate\Database\Migrations\Migration;

/**
 * Ghi chú: ứng dụng này KHÔNG tạo bảng users/sessions/cache.
 *
 * Nó dùng chung cơ sở dữ liệu với CMS (showbiz_cms), nên các bảng đó đã có sẵn
 * — và dùng chung là có chủ đích: một tài khoản quản trị vào được cả hai nơi.
 * Migration rỗng này tồn tại để người đọc thư mục migrations hiểu vì sao thiếu.
 */
return new class extends Migration
{
    public function up(): void {}

    public function down(): void {}
};
