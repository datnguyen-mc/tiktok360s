<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Thư viện prompt dùng lại.
 *
 * Khác với prompt của kênh (gắn cố định vào một kênh, dùng cho lịch chạy hằng
 * ngày), preset ở đây là prompt rời — soạn lúc bấm "Tạo video", lưu lại rồi lần
 * sau gọi ra dùng tiếp mà không phải gõ lại.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prompt_presets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('template');
            $table->text('negative_prompt')->nullable();
            $table->foreignId('video_engine_id')->nullable()->constrained()->nullOnDelete()
                  ->comment('Engine ưa dùng cho prompt này; rỗng = engine mặc định');
            $table->unsignedInteger('usage_count')->default(0);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();

            $table->index('last_used_at');
        });

        Schema::table('runs', function (Blueprint $table) {
            $table->foreignId('prompt_preset_id')->nullable()->after('video_engine_id')
                  ->constrained()->nullOnDelete();
            $table->text('prompt_template')->nullable()->after('clip_provider')
                  ->comment('Prompt đã dùng cho lần chạy này — giữ lại để tra ngược');
        });
    }

    public function down(): void
    {
        Schema::table('runs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('prompt_preset_id');
            $table->dropColumn('prompt_template');
        });
        Schema::dropIfExists('prompt_presets');
    }
};
