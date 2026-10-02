<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Vị trí đã đi tới trong dàn bài, cho series dạng danh mục.
 *
 * Series kể chuyện suy ra được vị trí từ số tập (tập 7 = mục 7). Series danh
 * mục thì không: mỗi tập gom 3–5 câu lạc bộ tuỳ ngày, nên phải ghi lại đã dùng
 * hết bao nhiêu mục. Thiếu cột này là tập sau sẽ nói lại đúng mấy CLB vừa nói.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('series_episodes', function (Blueprint $table) {
            if (! Schema::hasColumn('series_episodes', 'da_dung')) {
                $table->unsignedSmallInteger('da_dung')->nullable()
                      ->comment('Số mục dàn bài đã dùng hết tính tới tập này');
            }
            if (! Schema::hasColumn('series_episodes', 'muc')) {
                $table->json('muc')->nullable()->comment('Tên các mục trong tập');
            }
        });
    }

    public function down(): void
    {
        Schema::table('series_episodes', function (Blueprint $table) {
            $table->dropColumn(['da_dung', 'muc']);
        });
    }
};
