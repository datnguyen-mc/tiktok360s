<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Số token của mỗi lần gọi mô hình ngôn ngữ.
 *
 * Bảng `generation_calls` vốn dựng cho clip video nên tính tiền theo giây. Khâu
 * viết kịch bản tính theo token, mà hai thứ đều là tiền API của cùng một lượt
 * chạy — gom chung một bảng thì trang Chi phí cộng được tổng thật.
 */
return new class extends Migration
{
    public function up(): void
    {
        // MySQL không gói DDL trong giao dịch: chạy dở rồi hỏng thì phần đã chạy
        // vẫn nằm đó, nên mỗi cột phải tự kiểm tra trước.
        foreach (['tokens_in', 'tokens_out'] as $cot) {
            if (! Schema::hasColumn('generation_calls', $cot)) {
                Schema::table('generation_calls', function (Blueprint $table) use ($cot) {
                    $table->unsignedInteger($cot)->nullable()->after('seconds');
                });
            }
        }
    }

    public function down(): void
    {
        foreach (['tokens_in', 'tokens_out'] as $cot) {
            if (Schema::hasColumn('generation_calls', $cot)) {
                Schema::table('generation_calls', fn (Blueprint $t) => $t->dropColumn($cot));
            }
        }
    }
};
