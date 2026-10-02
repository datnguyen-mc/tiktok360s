<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Cho phép một chủ đề ra nhiều video trong cùng một ngày.
 *
 * Khoá cũ là (chủ đề, ngày) — đúng với kênh điểm tin: mỗi ngày một bản tin.
 * Nhưng kênh tư liệu ra 3–5 video mỗi ngày, mỗi video một câu lạc bộ, nên video
 * thứ hai sẽ GHI ĐÈ lên video thứ nhất và mất trắng.
 *
 * `episode` = 0 với kênh điểm tin (mỗi ngày một video), = số tập với kênh series.
 * Mặc định 0 chứ không để null: MySQL coi mỗi NULL là một giá trị khác nhau nên
 * ràng buộc duy nhất sẽ mất tác dụng, và chạy lại sẽ sinh bản trùng.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('runs', function (Blueprint $table) {
            if (! Schema::hasColumn('runs', 'episode')) {
                $table->unsignedSmallInteger('episode')->default(0)
                      ->comment('0 = kênh điểm tin; >0 = số tập của kênh series')
                      ->after('run_date');
            }
        });

        if ($this->hasIndex('runs', 'runs_topic_date_unique')) {
            Schema::table('runs', fn (Blueprint $t) => $t->dropUnique('runs_topic_date_unique'));
        }
        if (! $this->hasIndex('runs', 'runs_topic_date_episode_unique')) {
            Schema::table('runs', fn (Blueprint $t) => $t->unique(
                ['topic', 'run_date', 'episode'], 'runs_topic_date_episode_unique'));
        }
    }

    public function down(): void
    {
        if ($this->hasIndex('runs', 'runs_topic_date_episode_unique')) {
            Schema::table('runs', fn (Blueprint $t) => $t->dropUnique('runs_topic_date_episode_unique'));
        }
        Schema::table('runs', function (Blueprint $table) {
            $table->dropColumn('episode');
            $table->unique(['topic', 'run_date'], 'runs_topic_date_unique');
        });
    }

    private function hasIndex(string $table, string $index): bool
    {
        return collect(DB::select("SHOW INDEX FROM `{$table}`"))
            ->contains(fn ($r) => $r->Key_name === $index);
    }
};
