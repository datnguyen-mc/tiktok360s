<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Nhật ký từng bước của một lần dựng video.
 *
 * Bản ghi được đẩy lên NGAY khi mỗi bước kết thúc, không đợi tới cuối — nhờ vậy
 * mở CMS lúc dây chuyền đang chạy vẫn thấy nó đang ở bước nào, và khi hỏng thì
 * biết chính xác hỏng ở đâu thay vì chỉ thấy "thất bại".
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('run_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('run_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('sequence');
            $table->string('step', 40)->comment('fetch, script, tts, aiclip, visuals, render, cms');
            $table->string('label');
            $table->string('status', 12)->default('running')->comment('running | done | failed');
            $table->unsignedInteger('duration_ms')->nullable();
            $table->text('detail')->nullable()->comment('Một dòng tóm tắt kết quả');
            $table->json('meta')->nullable()->comment('Số đo của bước, vd số tin, số clip');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();

            $table->unique(['run_id', 'step']);
            $table->index(['run_id', 'sequence']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('run_steps');
    }
};
