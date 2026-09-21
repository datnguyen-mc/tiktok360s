<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Nhiều chủ đề trên cùng một hệ thống (showbiz, bóng đá…).
 *
 * Quan trọng: trước đây mỗi ngày chỉ có một video nên `run_date` đủ để định danh.
 * Giờ hai chủ đề cùng chạy trong một ngày, nên khoá định danh phải là
 * (chủ đề, ngày) — nếu không, video bóng đá sẽ ghi đè video showbiz cùng ngày.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('runs', function (Blueprint $table) {
            $table->string('topic', 40)->default('showbiz')->after('id');
            $table->string('topic_name', 80)->nullable()->after('topic');
            $table->unique(['topic', 'run_date'], 'runs_topic_date_unique');
            $table->index('topic');
        });

        Schema::table('tiktok_accounts', function (Blueprint $table) {
            $table->string('topic', 40)->nullable()->after('nickname')
                  ->comment('Kênh này đăng chủ đề nào; rỗng = nhận mọi chủ đề');
        });

        Schema::table('prompt_presets', function (Blueprint $table) {
            $table->string('topic', 40)->nullable()->after('name')
                  ->comment('Prompt dành riêng cho chủ đề nào; rỗng = dùng chung');
        });
    }

    public function down(): void
    {
        Schema::table('runs', function (Blueprint $table) {
            $table->dropUnique('runs_topic_date_unique');
            $table->dropIndex(['topic']);
            $table->dropColumn(['topic', 'topic_name']);
        });
        Schema::table('tiktok_accounts', fn (Blueprint $t) => $t->dropColumn('topic'));
        Schema::table('prompt_presets', fn (Blueprint $t) => $t->dropColumn('topic'));
    }
};
