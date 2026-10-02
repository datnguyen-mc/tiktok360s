<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Mỗi lần bấm "Tạo video" là một tiến trình dây chuyền chạy nền.
 *
 * Trước đây CMS bắn lệnh rồi quên: không giữ PID nên không có cách nào dừng một
 * lượt render đang chạy, cũng không biết có bao nhiêu lượt đang chạy song song.
 * Bảng này giữ lại đúng những thứ cần để điều khiển.
 *
 * `run_id` để trống lúc mới chạy — bản ghi lượt chạy chỉ xuất hiện khi dây
 * chuyền báo bước đầu tiên về, tức là vài giây sau khi tiến trình khởi động.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pipeline_jobs', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('pid')->nullable();
            $table->string('topic', 40)->nullable();
            $table->date('run_date')->nullable();
            $table->text('command');
            $table->string('working_dir', 500)->nullable();

            $table->string('status', 20)->default('running')
                  ->comment('running | done | stopped | failed');
            $table->foreignId('run_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('video_engine_id')->nullable()
                  ->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['status', 'started_at']);
            $table->index(['topic', 'run_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pipeline_jobs');
    }
};
