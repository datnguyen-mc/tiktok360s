<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Đổi slug chuyên mục và trang tĩnh sang tiếng Anh.
 *
 * Đổi slug là làm hỏng mọi liên kết đã chia sẻ và mọi thứ Google đã lập chỉ
 * mục. Nên trước khi đổi, dựng bảng ghi nhớ địa chỉ cũ — cả lần này lẫn mọi lần
 * quản trị viên đổi slug về sau đều được ghi vào đó, và trang cũ trả về 301 thay
 * vì 404.
 */
return new class extends Migration
{
    private const CATEGORIES = [
        'bongda'      => 'football',
        'cong-nghe'   => 'technology',
        'kinh-doanh'  => 'business',
        'the-gioi'    => 'world',
        'doi-song'    => 'life',
        'suc-khoe'    => 'health',
        // 'showbiz' và 'drama' vốn đã là tiếng Anh
    ];

    private const PAGES = [
        'gioi-thieu'         => 'about',
        'lien-he'            => 'contact',
        'dieu-khoan'         => 'terms',
        'chinh-sach-bao-mat' => 'privacy',
    ];

    public function up(): void
    {
        Schema::create('slug_redirects', function (Blueprint $table) {
            $table->id();
            $table->string('kind', 20)->comment('category | page | article');
            $table->string('old_slug', 200);
            $table->string('new_slug', 200);
            $table->timestamp('created_at')->useCurrent();

            // Một slug cũ chỉ trỏ tới một chỗ; đổi A→B→C thì A phải trỏ thẳng C
            $table->unique(['kind', 'old_slug']);
        });

        $this->rename('categories', 'category', self::CATEGORIES);
        $this->rename('pages', 'page', self::PAGES);
    }

    private function rename(string $table, string $kind, array $map): void
    {
        foreach ($map as $old => $new) {
            if (! DB::table($table)->where('slug', $old)->exists()) {
                continue;
            }
            // Slug mới đã có ai dùng thì bỏ qua, đổi vào là trùng khoá
            if (DB::table($table)->where('slug', $new)->exists()) {
                continue;
            }

            DB::table($table)->where('slug', $old)->update(['slug' => $new]);

            DB::table('slug_redirects')->updateOrInsert(
                ['kind' => $kind, 'old_slug' => $old],
                ['new_slug' => $new, 'created_at' => now()]
            );

            // Chuỗi chuyển hướng cũ phải trỏ thẳng tới đích mới: A→B rồi B→C mà
            // không sửa thì người vào A bị chuyển hai lần, Google tính là lỗi.
            DB::table('slug_redirects')->where('kind', $kind)
                ->where('new_slug', $old)->update(['new_slug' => $new]);
        }
    }

    public function down(): void
    {
        foreach ([['categories', self::CATEGORIES], ['pages', self::PAGES]] as [$table, $map]) {
            foreach ($map as $old => $new) {
                DB::table($table)->where('slug', $new)->update(['slug' => $old]);
            }
        }

        Schema::dropIfExists('slug_redirects');
    }
};
