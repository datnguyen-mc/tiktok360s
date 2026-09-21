<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phân quyền người dùng.
 *
 * QUAN TRỌNG: bảng users dùng chung giữa website và CMS video. Trước khi mở
 * đăng ký công khai, khu quản trị chỉ được chặn bằng `auth` — nghĩa là bất kỳ
 * độc giả nào đăng ký xong cũng vào thẳng được /quan-tri của CẢ HAI ứng dụng.
 * Cột `role` là thứ bịt lỗ hổng đó.
 *
 * Tài khoản đang có được đặt thành admin, vì chúng được tạo từ CMS.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->default('reader')->after('email')
                  ->comment('admin | editor | reader');
            $table->string('username', 40)->nullable()->unique()->after('role');
            $table->string('bio', 300)->nullable()->after('avatar_url');
            $table->timestamp('last_seen_at')->nullable();
            $table->index('role');
        });

        // Mọi tài khoản đã tồn tại đều đến từ CMS → là quản trị viên
        \Illuminate\Support\Facades\DB::table('users')->update(['role' => 'admin']);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropColumn(['role', 'username', 'bio', 'last_seen_at']);
        });
    }
};
