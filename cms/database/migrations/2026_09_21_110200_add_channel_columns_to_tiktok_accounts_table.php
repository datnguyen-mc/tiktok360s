<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Biến mỗi tài khoản TikTok thành một "kênh" có thiết lập đăng bài riêng. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tiktok_accounts', function (Blueprint $table) {
            $table->string('nickname')->nullable()->after('display_name')
                  ->comment('Tên gọi nội bộ, vd "Kênh chính"');
            $table->boolean('auto_publish')->default(false)->after('is_active')
                  ->comment('Tự tạo job đăng ngay khi pipeline nạp video mới');
            $table->time('publish_time')->nullable()->after('auto_publish')
                  ->comment('Giờ đăng mong muốn; bỏ trống là đăng ngay');
            $table->string('default_mode', 20)->default('inbox')->after('publish_time');
            $table->string('default_privacy', 40)->default('SELF_ONLY')->after('default_mode');
            $table->text('caption_suffix')->nullable()->after('default_privacy')
                  ->comment('Chèn thêm vào cuối caption, vd hashtag riêng của kênh');
            $table->text('notes')->nullable()->after('caption_suffix');
        });
    }

    public function down(): void
    {
        Schema::table('tiktok_accounts', function (Blueprint $table) {
            $table->dropColumn([
                'nickname', 'auto_publish', 'publish_time',
                'default_mode', 'default_privacy', 'caption_suffix', 'notes',
            ]);
        });
    }
};
