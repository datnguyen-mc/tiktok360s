<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Các tập của kênh phim nhiều tập.
 *
 * Bảng này là TRÍ NHỚ của series: mỗi ngày AI đọc tập gần nhất ở đây rồi viết
 * tập kế tiếp. Mất bảng là mất mạch chuyện — tập nào cũng sẽ như tập một.
 *
 * `so_tap` duy nhất trong mỗi chủ đề: chạy hai lần cùng ngày không được sinh ra
 * hai tập cùng số, và cũng không được nhảy số.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('series_episodes', function (Blueprint $table) {
            $table->id();
            $table->string('topic', 40);
            $table->unsignedSmallInteger('so_tap');
            $table->date('ngay')->nullable();

            $table->string('tieu_de', 200);
            $table->text('tom_tat')->nullable();
            $table->text('cau_chot')->nullable()->comment('Câu bỏ lửng cuối tập');
            $table->text('trang_thai')->nullable()->comment('Quan hệ nhân vật sau tập');
            $table->json('canh')->nullable()->comment('Danh sách cảnh: headline + vo');

            $table->string('model', 60)->nullable();
            $table->foreignId('run_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->unique(['topic', 'so_tap']);
            $table->index(['topic', 'ngay']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('series_episodes');
    }
};
