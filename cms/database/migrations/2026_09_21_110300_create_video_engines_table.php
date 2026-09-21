<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Nơi video được tạo ra.
 *
 *  local — chạy dây chuyền Python ngay trên máy này
 *  http  — gọi sang một dịch vụ dựng video khác qua HTTP (model riêng của bạn)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('video_engines', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type', 20)->default('local')->comment('local | http');

            // Dành cho type=local
            $table->string('command', 1000)->nullable()
                  ->comment('Lệnh chạy, vd: .venv/bin/python -m pipeline.run_daily');
            $table->string('working_dir', 500)->nullable();

            // Dành cho type=http
            $table->string('endpoint', 1000)->nullable();
            $table->text('api_key')->nullable();
            $table->string('auth_header')->default('Authorization');
            $table->string('auth_prefix')->default('Bearer');

            $table->json('payload_template')->nullable()
                  ->comment('Tham số mặc định gửi kèm mỗi lần gọi');
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_used_at')->nullable();
            $table->text('last_error')->nullable();
            $table->timestamps();
        });

        Schema::table('runs', function (Blueprint $table) {
            $table->foreignId('video_engine_id')->nullable()->after('id')
                  ->constrained()->nullOnDelete();
            $table->foreignId('tiktok_account_id')->nullable()->after('video_engine_id')
                  ->constrained()->nullOnDelete()
                  ->comment('Kênh mà video này dành cho');
        });
    }

    public function down(): void
    {
        Schema::table('runs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('video_engine_id');
            $table->dropConstrainedForeignId('tiktok_account_id');
        });
        Schema::dropIfExists('video_engines');
    }
};
