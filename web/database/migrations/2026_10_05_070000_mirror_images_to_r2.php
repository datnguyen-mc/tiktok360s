<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Giữ lại địa chỉ ảnh gốc trước khi thay bằng địa chỉ trên R2.
 *
 * Khoá trên R2 sinh từ sha1 của địa chỉ gốc nên không suy ngược ra được. Không
 * cất riêng thì sau này muốn lùi lại, hay muốn gương lại ảnh hỏng, là mất dấu.
 */
return new class extends Migration
{
    public function up(): void
    {
        // MySQL không gói DDL trong giao dịch được: migration chạy dở rồi hỏng
        // thì phần đã chạy vẫn nằm đó, nên mỗi bước phải tự kiểm tra trước.
        if (! Schema::hasColumn('articles', 'image_source_url')) {
            Schema::table('articles', function (Blueprint $table) {
                $table->string('image_source_url', 1000)->nullable()->after('image_url');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('articles', 'image_source_url')) {
            Schema::table('articles', function (Blueprint $table) {
                $table->dropColumn('image_source_url');
            });
        }
    }
};
