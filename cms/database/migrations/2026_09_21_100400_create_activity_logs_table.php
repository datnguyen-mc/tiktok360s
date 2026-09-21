<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Nhật ký sự kiện — dòng thời gian để lần lại khi có sự cố. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('level', 12)->default('info')->comment('info | warning | error');
            $table->string('event', 60)->comment('run.ingested, publish.failed, tiktok.connected...');
            $table->string('message', 1000);
            $table->nullableMorphs('subject');
            $table->json('context')->nullable();
            $table->timestamps();

            $table->index(['event', 'created_at']);
            $table->index(['level', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
