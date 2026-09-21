<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Bật/tắt việc lấy nội dung đầy đủ theo từng chuyên mục.
 *
 * Mặc định 0 = chỉ lưu sapo. Xem cảnh báo bản quyền trong ContentExtractor
 * trước khi tăng số này.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->unsignedTinyInteger('content_paragraphs')->default(0)->after('exclude_keywords')
                  ->comment('Số đoạn lấy về từ bài gốc; 0 = chỉ lưu sapo');
        });
    }

    public function down(): void
    {
        Schema::table('categories', fn (Blueprint $t) => $t->dropColumn('content_paragraphs'));
    }
};
