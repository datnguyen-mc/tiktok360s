<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Lấy nội dung và ảnh cho mọi chuyên mục, và nhớ những bài đã thử.
 *
 * Trước đây `content_paragraphs` mặc định là 0 nên phần lớn chuyên mục không
 * bao giờ lấy nội dung — bài chỉ có mỗi sapo. Và vì bộ lấy tin luôn chọn "bài
 * mới nhất chưa có nội dung", vài bài không trích được (báo đổi bố cục, trang
 * bị chặn) cứ chiếm chỗ mãi và chặn hết phần còn lại.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            if (! Schema::hasColumn('articles', 'content_fetched_at')) {
                $table->timestamp('content_fetched_at')->nullable()
                      ->comment('Lần cuối thử trích nội dung — kể cả khi thất bại');
                $table->index(['content_fetched_at', 'published_at']);
            }
        });

        // Bài đã có nội dung coi như đã thử thành công, khỏi lấy lại
        DB::table('articles')->whereNotNull('content')
            ->update(['content_fetched_at' => now()]);

        // Mọi chuyên mục đều lấy nội dung. 6 đoạn là đủ để bài có giá trị đọc
        // mà vẫn rõ là bản trích dẫn, không phải bản sao toàn văn.
        DB::table('categories')->where('content_paragraphs', '<=', 0)
            ->update(['content_paragraphs' => 6]);
    }

    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropIndex(['content_fetched_at', 'published_at']);
            $table->dropColumn('content_fetched_at');
        });
    }
};
