<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Bổ sung phần "ai, từ đâu, bằng đường nào" cho nhật ký hoạt động.
 *
 * Bảng cũ chỉ có thông điệp và mức độ. Một nhật ký kiểm toán mà không biết ai
 * làm thì chỉ là một dòng chữ — không truy được trách nhiệm, không biết tài
 * khoản nào bị chiếm, không biết lỗi đến từ giao diện hay từ dây chuyền.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            foreach ([
                'user_id'     => fn () => $table->foreignId('user_id')->nullable()
                                    ->constrained()->nullOnDelete(),
                'actor'       => fn () => $table->string('actor', 120)->nullable()
                                    ->comment('Email lúc xảy ra — giữ lại kể cả khi tài khoản bị xoá'),
                'ip'          => fn () => $table->string('ip', 45)->nullable(),
                'method'      => fn () => $table->string('method', 10)->nullable(),
                'path'        => fn () => $table->string('path', 255)->nullable(),
                'status'      => fn () => $table->unsignedSmallInteger('status')->nullable(),
                'duration_ms' => fn () => $table->unsignedInteger('duration_ms')->nullable(),
            ] as $col => $add) {
                if (! Schema::hasColumn('activity_logs', $col)) {
                    $add();
                }
            }
        });

        // Kiểm tra trước khi thêm: chỉ mục có thể đã có từ migration gốc, và
        // MySQL không quay lui được DDL nên lần chạy lại sẽ chết ở đây trong khi
        // các cột phía trên đã thêm xong.
        foreach ([['level', 'created_at'], ['event', 'created_at']] as $cols) {
            $name = 'activity_logs_'.implode('_', $cols).'_index';
            if (! $this->hasIndex('activity_logs', $name)) {
                Schema::table('activity_logs', fn (Blueprint $t) => $t->index($cols));
            }
        }
    }

    private function hasIndex(string $table, string $index): bool
    {
        return collect(DB::select("SHOW INDEX FROM `{$table}`"))
            ->contains(fn ($r) => $r->Key_name === $index);
    }

    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn(['actor', 'ip', 'method', 'path', 'status', 'duration_ms']);
        });
    }
};
