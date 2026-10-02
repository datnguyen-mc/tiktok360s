<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Chi tiết HTTP cho mỗi lần gọi API sinh cảnh.
 *
 * Chỉ có `error_message` là không đủ khi soi lỗi: chuỗi lỗi không cho biết
 * Google trả về 429 (vượt hạn mức) hay 400 (prompt bị chặn) hay 0 (không chạm
 * được tới máy chủ) — ba nguyên nhân hoàn toàn khác nhau, xử lý khác nhau.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('generation_calls', function (Blueprint $table) {
            if (! Schema::hasColumn('generation_calls', 'http_status')) {
                $table->unsignedSmallInteger('http_status')->nullable()
                      ->comment('0 = không gọi được tới máy chủ');
            }
            if (! Schema::hasColumn('generation_calls', 'duration_ms')) {
                $table->unsignedInteger('duration_ms')->nullable()
                      ->comment('Tổng thời gian cho một clip, kể cả các lần hỏi trạng thái');
            }
            if (! Schema::hasColumn('generation_calls', 'requests')) {
                $table->unsignedSmallInteger('requests')->nullable()
                      ->comment('Số lần gọi HTTP để ra được một clip');
            }
        });

        Schema::table('generation_calls', function (Blueprint $table) {
            $table->index(['status', 'http_status']);
        });
    }

    public function down(): void
    {
        Schema::table('generation_calls', function (Blueprint $table) {
            $table->dropIndex(['status', 'http_status']);
            $table->dropColumn(['http_status', 'duration_ms', 'requests']);
        });
    }
};
