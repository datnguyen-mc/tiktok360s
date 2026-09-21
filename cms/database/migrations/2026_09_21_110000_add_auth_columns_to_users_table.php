<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Đăng nhập Google và xác thực hai lớp bằng mã OTP. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Kiểm tra từng cột: MySQL không quay lui được DDL, nên migration
            // hỏng nửa chừng sẽ để lại cột đã thêm mà không ghi nhận migration.
            if (! Schema::hasColumn('users', 'google_id')) {
                $table->string('google_id')->nullable()->unique()->after('email');
            }
            if (! Schema::hasColumn('users', 'avatar_url')) {
                $table->string('avatar_url', 1000)->nullable();
            }

            // Bí mật TOTP và mã dự phòng đều mã hoá ở tầng model
            $table->text('two_factor_secret')->nullable()->after('password');
            $table->text('two_factor_recovery_codes')->nullable()->after('two_factor_secret');
            $table->timestamp('two_factor_confirmed_at')->nullable()->after('two_factor_recovery_codes');

            // Mật khẩu có thể rỗng với tài khoản chỉ đăng nhập bằng Google
            $table->string('password')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'google_id', 'avatar_url',
                'two_factor_secret', 'two_factor_recovery_codes', 'two_factor_confirmed_at',
            ]);
        });
    }
};
