<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Mỗi bản ghi là một lần chạy dây chuyền tạo video. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('runs', function (Blueprint $table) {
            $table->id();
            $table->date('run_date')->comment('Ngày của bản tin, theo giờ VN');
            $table->string('status', 20)->default('running')
                  ->comment('running | success | failed');
            $table->string('title')->nullable();

            // Thiết lập đã dùng — để truy ngược khi một video nghe khác thường
            $table->string('style', 30)->nullable()->comment('chuan | mien_tay');
            $table->string('voice_id', 60)->nullable();
            $table->string('voice_rate', 10)->nullable();

            // Số đo thực tế
            $table->unsignedSmallInteger('items_count')->default(0);
            $table->unsignedSmallInteger('scenes_count')->default(0);
            $table->unsignedInteger('syllables')->default(0);
            $table->decimal('duration_sec', 7, 2)->nullable();
            $table->decimal('estimated_sec', 7, 2)->nullable()
                  ->comment('Ước lượng lúc dựng kịch bản, để đo sai số mô hình');
            $table->unsignedTinyInteger('tts_attempts')->default(1);

            // Sản phẩm
            $table->string('video_path', 500)->nullable();
            $table->unsignedBigInteger('video_bytes')->nullable();
            $table->string('thumbnail_path', 500)->nullable();
            $table->text('caption')->nullable();

            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['run_date', 'status']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('runs');
    }
};
