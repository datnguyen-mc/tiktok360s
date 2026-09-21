<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tin bài.
 *
 * Dây chuyền mỗi ngày lấy về khoảng 350 tin nhưng chỉ dùng 10 cho video —
 * phần còn lại trước đây bị bỏ. Bảng này giữ lại tất cả, nên website có nội
 * dung dồi dào mà không tốn thêm một lần gọi mạng nào.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('topic', 40)->nullable()->index();

            $table->string('title', 500);
            $table->string('slug', 255)->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable()
                  ->comment('Nội dung tự viết; tin lấy từ RSS chỉ có excerpt');

            $table->string('image_url', 1000)->nullable();
            $table->string('source', 80)->nullable();
            $table->string('source_url', 1000)->nullable();

            // Chống trùng: cùng một tin được nhiều báo đăng, và dây chuyền chạy lại mỗi ngày
            $table->char('fingerprint', 40)->unique()
                  ->comment('SHA1 của tiêu đề đã chuẩn hoá — chặn trùng giữa các báo');

            $table->string('status', 12)->default('published')
                  ->comment('published | draft | hidden');
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_original')->default(false)
                  ->comment('Tự viết, không phải lấy từ RSS');

            $table->decimal('score', 6, 2)->nullable()->comment('Điểm độ hot lúc thu thập');
            $table->unsignedInteger('views')->default(0);
            $table->unsignedSmallInteger('reading_minutes')->nullable();

            $table->string('seo_title')->nullable();
            $table->string('seo_description', 320)->nullable();

            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            // Truy vấn chính: tin mới nhất theo chuyên mục
            $table->index(['status', 'published_at']);
            $table->index(['category_id', 'status', 'published_at'], 'articles_cat_feed_index');
            $table->index(['is_featured', 'published_at']);
            $table->fullText(['title', 'excerpt'], 'articles_search_fulltext');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
