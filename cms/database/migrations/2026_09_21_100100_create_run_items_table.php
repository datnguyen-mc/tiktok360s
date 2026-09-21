<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Các tin đã dùng trong một video — giữ lại để ghi credit và tra lại nguồn. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('run_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('run_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('position');
            $table->string('headline', 500);
            $table->string('source', 80)->nullable();
            $table->string('url', 1000)->nullable();
            $table->string('image_url', 1000)->nullable();
            $table->decimal('score', 6, 2)->nullable()->comment('Điểm độ hot lúc xếp hạng');
            $table->string('topic', 30)->nullable()->comment('Nhóm nội dung dùng để chọn câu cảm thán');
            $table->string('reaction', 200)->nullable();
            $table->text('vo')->nullable()->comment('Lời đọc của cảnh này');
            $table->decimal('scene_start', 7, 2)->nullable();
            $table->decimal('scene_dur', 7, 2)->nullable();
            $table->timestamps();

            $table->index(['run_id', 'position']);
            $table->index('source');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('run_items');
    }
};
