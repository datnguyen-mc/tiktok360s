<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Một lần đăng video lên TikTok: từ lúc bấm nút tới khi TikTok xử lý xong. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('publish_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('run_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tiktok_account_id')->nullable()->constrained()->nullOnDelete();

            $table->string('status', 24)->default('queued')
                  ->comment('queued | uploading | processing | published | failed | cancelled');
            $table->string('mode', 20)->default('inbox')->comment('inbox | direct_post');
            $table->string('privacy_level', 40)->nullable();
            $table->text('caption')->nullable();

            $table->string('publish_id')->nullable()->comment('Mã do TikTok cấp khi khởi tạo');
            $table->string('post_id')->nullable();
            $table->string('share_url', 1000)->nullable();

            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->text('error_message')->nullable();
            $table->json('last_response')->nullable();
            $table->timestamps();

            $table->index(['status', 'scheduled_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('publish_jobs');
    }
};
