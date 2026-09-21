<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Cho chuyên mục tự lấy tin.
 *
 * Trước đây website chỉ có nội dung của hai chủ đề mà dây chuyền video dựng
 * (showbiz, bóng đá). Muốn thêm chuyên mục Công nghệ hay Kinh doanh thì phải
 * dựng cả một chủ đề video — quá nặng cho nhu cầu chỉ là hiển thị tin.
 *
 * Giờ mỗi chuyên mục khai nguồn RSS riêng và tự lấy tin bằng `php artisan news:fetch`.
 * Chuyên mục nào nối với chủ đề video thì vẫn nhận tin từ dây chuyền như cũ.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->json('sources')->nullable()->after('topic')
                  ->comment('[{name, url}] — nguồn RSS riêng của chuyên mục');
            $table->json('require_keywords')->nullable()->after('sources')
                  ->comment('Tin phải chứa ít nhất một từ; rỗng = nhận tất cả');
            $table->json('exclude_keywords')->nullable()->after('require_keywords');
            $table->timestamp('fetched_at')->nullable()->after('exclude_keywords');
        });
    }

    public function down(): void
    {
        Schema::table('categories', fn (Blueprint $t) => $t->dropColumn([
            'sources', 'require_keywords', 'exclude_keywords', 'fetched_at',
        ]));
    }
};
