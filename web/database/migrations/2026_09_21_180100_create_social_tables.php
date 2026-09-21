<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Thích, lưu, bình luận — và các cột đếm sẵn trên bài. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('article_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            // Một người chỉ thích một bài một lần
            $table->unique(['article_id', 'user_id']);
        });

        Schema::create('bookmarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['article_id', 'user_id']);
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // Trả lời một bình luận khác. Chỉ một cấp — thảo luận lồng sâu rất
            // khó đọc trên điện thoại, và trang tin không cần tới mức đó.
            $table->foreignId('parent_id')->nullable()
                  ->constrained('comments')->cascadeOnDelete();
            $table->text('body');
            $table->string('status', 12)->default('visible')
                  ->comment('visible | hidden | spam');
            $table->unsignedInteger('likes_count')->default(0);
            $table->timestamps();

            $table->index(['article_id', 'status', 'created_at']);
        });

        Schema::create('comment_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['comment_id', 'user_id']);
        });

        Schema::table('articles', function (Blueprint $table) {
            // Đếm sẵn thay vì COUNT() mỗi lần hiển thị: trang chủ và trang
            // chuyên mục đều cần số này cho hàng chục bài một lúc.
            $table->unsignedInteger('likes_count')->default(0)->after('views');
            $table->unsignedInteger('comments_count')->default(0)->after('likes_count');
            $table->unsignedInteger('bookmarks_count')->default(0)->after('comments_count');
            $table->unsignedInteger('shares_count')->default(0)->after('bookmarks_count');

            // "Đọc nhiều" nên tính cả tương tác, không chỉ lượt xem
            $table->index(['status', 'views']);
        });
    }

    public function down(): void
    {
        Schema::table('articles', fn (Blueprint $t) => $t->dropColumn([
            'likes_count', 'comments_count', 'bookmarks_count', 'shares_count',
        ]));
        Schema::dropIfExists('comment_likes');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('bookmarks');
        Schema::dropIfExists('article_likes');
    }
};
