<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Địa chỉ video và ảnh bìa trên Cloudflare R2.
 *
 * Giữ song song với video_path chứ không thay thế: máy chạy dây chuyền vẫn có
 * file trong output/, đọc file tại chỗ thì nhanh hơn và không tốn băng thông.
 * URL chỉ dùng khi file cục bộ không còn — ví dụ CMS chạy trên máy khác.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('runs', function (Blueprint $table) {
            $table->string('video_url', 700)->nullable()->after('video_path');
            $table->string('thumbnail_url', 700)->nullable()->after('thumbnail_path');
        });
    }

    public function down(): void
    {
        Schema::table('runs', function (Blueprint $table) {
            $table->dropColumn(['video_url', 'thumbnail_url']);
        });
    }
};
