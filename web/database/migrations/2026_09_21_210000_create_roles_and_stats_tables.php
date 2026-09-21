<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Vai trò: chuyển từ hằng số trong code xuống cơ sở dữ liệu ───────
        // Danh mục *quyền* vẫn nằm trong code (Roles::ABILITIES) — một quyền
        // không có dòng code nào kiểm tra thì chẳng có ý nghĩa gì. Chỉ việc
        // "vai trò nào có quyền nào" mới là thứ quản trị viên cần đổi.
        Schema::create('roles', function (Blueprint $table) {
            $table->string('slug', 30)->primary();
            $table->string('name', 60);
            $table->string('color', 9)->default('#74747F');
            $table->json('abilities');
            $table->boolean('is_system')->default(false)
                  ->comment('Vai trò hệ thống: không xoá, không sửa quyền');
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });

        // ── Lượt truy cập thô ───────────────────────────────────────────────
        // Bảng này lớn rất nhanh nên chỉ giữ vài ngày: lệnh gom số chạy 10 phút
        // một lần, gom xong thì xoá phần đã quá hạn.
        Schema::create('visits', function (Blueprint $table) {
            $table->id();
            $table->string('path', 255);
            $table->string('kind', 20)->index()
                  ->comment('home | article | category | search | page | other');
            $table->unsignedBigInteger('article_id')->nullable()->index();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->char('visitor', 32)->comment('Băm của phiên — không lưu IP thô');
            $table->string('referrer_host', 120)->nullable();
            $table->string('device', 10)->nullable()->comment('mobile | tablet | desktop');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['created_at', 'kind']);
            $table->index(['visitor', 'created_at']);
        });

        // ── Số liệu đã gom theo ngày ────────────────────────────────────────
        Schema::create('daily_stats', function (Blueprint $table) {
            $table->date('date')->primary();
            $table->unsignedInteger('views')->default(0);
            $table->unsignedInteger('visitors')->default(0);
            $table->unsignedInteger('article_views')->default(0);
            $table->unsignedInteger('searches')->default(0);
            $table->unsignedInteger('new_users')->default(0);
            $table->unsignedInteger('new_articles')->default(0);
            $table->unsignedInteger('comments')->default(0);
            $table->unsignedInteger('likes')->default(0);
            $table->json('by_hour')->nullable()->comment('24 số: lượt xem theo giờ');
            $table->json('by_device')->nullable();
            $table->json('by_referrer')->nullable();
            $table->json('by_category')->nullable();
            $table->json('top_articles')->nullable();
            $table->timestamp('rolled_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_stats');
        Schema::dropIfExists('visits');
        Schema::dropIfExists('roles');
    }
};
