<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Chuyên mục của website tin tức.
 *
 * `topic` nối với chủ đề của dây chuyền video (showbiz, bongda…) để tin lấy về
 * tự vào đúng chuyên mục, và trang chuyên mục hiển thị được cả video của chủ đề đó.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 80)->unique();
            $table->string('name', 80);
            $table->string('topic', 40)->nullable()->index()
                  ->comment('Chủ đề tương ứng bên dây chuyền video');
            $table->string('description', 255)->nullable();
            $table->string('color', 9)->default('#FE2C55');
            $table->string('icon', 40)->nullable();
            $table->unsignedSmallInteger('sort')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('in_menu')->default(true);

            // SEO riêng cho trang chuyên mục
            $table->string('seo_title')->nullable();
            $table->string('seo_description', 320)->nullable();

            $table->timestamps();
            $table->index(['is_active', 'sort']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
