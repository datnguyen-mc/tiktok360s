<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Sinh cảnh bằng model AI (Veo 3, Kling) thay cho ảnh báo chí.
 *
 * Cả hai model đều chỉ tạo được clip ngắn (Veo 4–8 giây, Kling 5 hoặc 10 giây),
 * nên "video dài" được ghép từ nhiều clip: mỗi tin một clip, khớp vào đúng cảnh
 * của lời đọc. Vì vậy mới cần lưu prompt và chi phí ở mức từng cảnh.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('video_engines', function (Blueprint $table) {
            $table->string('model', 80)->nullable()->after('type')
                  ->comment('veo-3.1-fast-generate-preview, kling-v2-master…');
            $table->text('api_secret')->nullable()->after('api_key')
                  ->comment('Kling cần cặp Access Key + Secret Key để ký JWT');
            $table->string('resolution', 10)->default('720p')->after('model');
            $table->string('aspect_ratio', 10)->default('9:16')->after('resolution');
            $table->unsignedTinyInteger('clip_seconds')->default(8)->after('aspect_ratio')
                  ->comment('Độ dài mỗi clip; Veo: 4/6/8, Kling: 5/10');
            $table->string('mode', 10)->nullable()->after('clip_seconds')
                  ->comment('Kling: std | pro');
            $table->text('negative_prompt')->nullable()->after('mode');
            $table->decimal('cost_per_second', 8, 4)->nullable()->after('negative_prompt')
                  ->comment('Đơn giá USD/giây, dùng để ước tính trước khi chạy');
        });

        Schema::table('tiktok_accounts', function (Blueprint $table) {
            $table->foreignId('video_engine_id')->nullable()->after('id')
                  ->constrained()->nullOnDelete()
                  ->comment('Engine dùng cho kênh này; rỗng = engine mặc định');
            $table->text('prompt_template')->nullable()->after('caption_suffix')
                  ->comment('Mẫu prompt tạo cảnh, có biến {tieu_de}, {nguon}…');
            $table->text('negative_prompt')->nullable()->after('prompt_template');
        });

        Schema::table('runs', function (Blueprint $table) {
            $table->string('clip_provider', 20)->nullable()->after('style');
            $table->decimal('generation_cost_usd', 10, 4)->nullable()->after('clip_provider');
        });

        Schema::table('run_items', function (Blueprint $table) {
            $table->text('clip_prompt')->nullable()->after('vo');
            $table->string('clip_url', 1000)->nullable()->after('clip_prompt');
            $table->decimal('clip_cost_usd', 8, 4)->nullable()->after('clip_url');
        });
    }

    public function down(): void
    {
        Schema::table('run_items', fn (Blueprint $t) => $t->dropColumn(['clip_prompt', 'clip_url', 'clip_cost_usd']));
        Schema::table('runs', fn (Blueprint $t) => $t->dropColumn(['clip_provider', 'generation_cost_usd']));
        Schema::table('tiktok_accounts', function (Blueprint $t) {
            $t->dropConstrainedForeignId('video_engine_id');
            $t->dropColumn(['prompt_template', 'negative_prompt']);
        });
        Schema::table('video_engines', fn (Blueprint $t) => $t->dropColumn([
            'model', 'api_secret', 'resolution', 'aspect_ratio',
            'clip_seconds', 'mode', 'negative_prompt', 'cost_per_second',
        ]));
    }
};
