<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Tài khoản TikTok đã kết nối. Token được mã hoá ở tầng model (casts encrypted). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tiktok_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('open_id')->unique();
            $table->string('union_id')->nullable();
            $table->string('display_name')->nullable();
            $table->string('avatar_url', 1000)->nullable();

            // text vì chuỗi đã mã hoá dài hơn token gốc nhiều
            $table->text('access_token')->nullable();
            $table->text('refresh_token')->nullable();
            $table->timestamp('access_expires_at')->nullable();
            $table->timestamp('refresh_expires_at')->nullable();
            $table->string('scopes', 500)->nullable();

            // Chụp lại từ creator_info — TikTok bắt buộc hỏi trước mỗi lần đăng
            $table->json('creator_info')->nullable();
            $table->timestamp('creator_info_at')->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tiktok_accounts');
    }
};
