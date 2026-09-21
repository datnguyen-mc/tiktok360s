<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Nội dung của website mà trước đây phải sửa file mới đổi được.
 *
 * Tên bảng có tiền tố `web_` vì cơ sở dữ liệu dùng chung với CMS video, và CMS
 * đã có bảng `settings` riêng cho khoá API. Trùng tên là hai ứng dụng ghi đè
 * lên nhau.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Cấu hình site: tên, mô tả, logo, mạng xã hội, SEO mặc định…
        Schema::create('web_settings', function (Blueprint $table) {
            $table->string('key', 60)->primary();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Trang tĩnh: giới thiệu, liên hệ, điều khoản, chính sách…
        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->string('title', 200);
            $table->string('excerpt', 300)->nullable();
            $table->longText('content')->nullable();
            $table->boolean('is_published')->default(true);
            $table->boolean('in_footer')->default(true);
            $table->unsignedSmallInteger('sort')->default(0);
            $table->string('seo_title', 200)->nullable();
            $table->string('seo_description', 300)->nullable();
            $table->timestamps();

            $table->index(['is_published', 'sort']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pages');
        Schema::dropIfExists('web_settings');
    }
};
