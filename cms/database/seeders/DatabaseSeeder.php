<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $email    = env('ADMIN_EMAIL', 'admin@showbiz.local');
        $password = env('ADMIN_PASSWORD', 'showbiz2026');

        User::updateOrCreate(
            ['email' => $email],
            ['name' => 'Quản trị', 'password' => Hash::make($password)]
        );

        $this->command->info("Tài khoản quản trị: {$email} / {$password}");
        $this->command->warn('Đổi mật khẩu ngay nếu CMS không chạy trên máy cá nhân.');
    }
}
