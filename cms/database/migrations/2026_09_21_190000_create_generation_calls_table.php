<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Nhật ký từng lần gọi API sinh cảnh (Veo / Kling), kèm chi phí.
 *
 * Vì sao cần bảng riêng khi đã có `runs.generation_cost_usd`:
 *   - cột kia chỉ là TỔNG của một lần chạy, không biết clip nào tốn bao nhiêu
 *   - lần gọi THẤT BẠI không để lại dấu vết nào, trong khi đó mới là thứ cần soi
 *   - đổi model hay đổi độ phân giải thì không có gì để so giá trước/sau
 *
 * run_id dùng nullOnDelete chứ KHÔNG cascade, và topic/run_date/title được ghi
 * lặp vào đây: xoá một video không được phép xoá luôn lịch sử tiền đã chi.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('generation_calls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('run_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('video_engine_id')->nullable()->constrained()->nullOnDelete();

            // Ghi lặp để bản ghi sống sót khi video hoặc engine bị xoá
            $table->string('provider', 30)->comment('veo | kling');
            $table->string('model', 80)->nullable();
            $table->string('resolution', 20)->nullable();
            $table->string('topic', 40)->nullable();
            $table->date('run_date')->nullable();
            $table->string('run_title')->nullable();

            $table->unsignedSmallInteger('scene_index')->nullable();
            $table->text('prompt')->nullable();
            $table->unsignedSmallInteger('seconds')->nullable()
                  ->comment('Độ dài clip được tính tiền');
            $table->decimal('cost_per_second', 8, 4)->nullable();
            $table->decimal('cost_usd', 10, 4)->default(0)
                  ->comment('Lần gọi thất bại = 0');

            $table->string('status', 20)->default('success')->comment('success | failed');
            $table->text('error_message')->nullable();
            $table->string('clip_url', 1000)->nullable();

            $table->timestamps();

            $table->index(['run_date', 'provider']);
            $table->index(['provider', 'model']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('generation_calls');
    }
};
