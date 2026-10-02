<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Lộ trình của kênh series: danh sách mục sẽ lần lượt lên video.
 *
 * Trước đây nằm trong topics/<slug>.json. Đưa xuống cơ sở dữ liệu vì ba lý do:
 *   · sửa được trong CMS, không phải vào máy chủ sửa file rồi khởi động lại
 *   · biết chắc mục nào đã lên video, mục nào chưa — file JSON không giữ được
 *     trạng thái, mà suy từ số tập thì sai ngay khi có một tập bị bỏ hoặc làm lại
 *   · thêm CLB mới chỉ là thêm một dòng, không đụng vào mã nguồn
 *
 * `da_dung_luc` là mốc đã lên video. NULL = chưa tới lượt.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('series_items', function (Blueprint $table) {
            $table->id();
            $table->string('topic', 40);
            $table->unsignedSmallInteger('so')->comment('Thứ tự trong lộ trình');
            $table->string('ten', 120);

            // Dữ kiện đưa cho AI. Để model tự nhớ là nó nhớ sai với đội ít tên tuổi.
            $table->string('nhom', 60)->nullable()->comment('Giải đấu / phân nhóm');
            $table->unsignedSmallInteger('nam')->nullable()->comment('Năm thành lập');
            $table->string('san', 160)->nullable();
            $table->text('danh_hieu')->nullable();
            $table->text('dau_an')->nullable()->comment('Huyền thoại, trận để đời, mốc gần đây');
            $table->text('ghi_chu')->nullable();

            $table->boolean('bat')->default(true)->comment('Tắt thì bỏ qua, không xoá');
            $table->timestamp('da_dung_luc')->nullable();
            $table->foreignId('episode_id')->nullable()
                  ->constrained('series_episodes')->nullOnDelete();

            $table->timestamps();

            $table->unique(['topic', 'so']);
            $table->index(['topic', 'da_dung_luc', 'so']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('series_items');
    }
};
