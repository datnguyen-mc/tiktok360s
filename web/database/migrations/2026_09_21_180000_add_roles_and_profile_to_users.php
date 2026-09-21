<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Phân quyền và hồ sơ độc giả.
 *
 * QUAN TRỌNG: bảng users dùng chung giữa website và CMS video. Trước khi mở
 * đăng ký công khai, khu quản trị chỉ được chặn bằng `auth` — nghĩa là bất kỳ
 * độc giả nào đăng ký xong cũng vào thẳng được /admin của CẢ HAI ứng dụng.
 * Cột `role` là thứ bịt lỗ hổng đó.
 *
 * Ranh giới sở hữu cột: `google_id` và `avatar_url` là của CMS, migration này
 * KHÔNG tạo chúng. Hai ứng dụng cùng tạo một cột thì ứng dụng chạy sau sẽ chết.
 *
 * Mỗi cột kiểm tra riêng trước khi thêm, vì MySQL không quay lui được lệnh DDL:
 * migration thêm bốn cột mà hỏng ở cột thứ ba thì ba cột đầu vẫn nằm lại, còn
 * migration thì chưa được ghi nhận — lần chạy sau chết vì "Duplicate column".
 */
return new class extends Migration
{
    public function up(): void
    {
        // Chỉ những tài khoản có TRƯỚC migration này mới được nâng lên admin:
        // chúng đến từ CMS. Ghi lại trước khi thêm cột, vì sau đó không phân
        // biệt được nữa.
        $existing = DB::table('users')->pluck('id');

        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'role')) {
                $table->string('role', 20)->default('reader')
                      ->comment('Tham chiếu bảng roles');
            }
            if (! Schema::hasColumn('users', 'username')) {
                $table->string('username', 40)->nullable()->unique();
            }
            if (! Schema::hasColumn('users', 'bio')) {
                $table->string('bio', 300)->nullable();
            }
            if (! Schema::hasColumn('users', 'last_seen_at')) {
                $table->timestamp('last_seen_at')->nullable();
            }
        });

        // Chỉ mục tạo riêng: gộp chung thì lần chạy lại sau khi hỏng nửa chừng
        // sẽ chết vì chỉ mục đã tồn tại.
        if (! $this->hasIndex('users', 'users_role_index')) {
            Schema::table('users', fn (Blueprint $t) => $t->index('role'));
        }

        if ($existing->isNotEmpty()) {
            DB::table('users')->whereIn('id', $existing)->update(['role' => 'admin']);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if ($this->hasIndex('users', 'users_role_index')) {
                $table->dropIndex(['role']);
            }
            $table->dropColumn(array_values(array_filter(
                ['role', 'username', 'bio', 'last_seen_at'],
                fn ($c) => Schema::hasColumn('users', $c)
            )));
        });
    }

    private function hasIndex(string $table, string $index): bool
    {
        return collect(DB::select("SHOW INDEX FROM `{$table}`"))
            ->contains(fn ($r) => $r->Key_name === $index);
    }
};
