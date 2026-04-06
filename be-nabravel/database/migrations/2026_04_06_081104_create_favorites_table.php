<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->string('user_email')->index();
            $table->string('type'); // 'hotel' or 'article'
            $table->string('target_id'); // slug or id
            $table->string('title')->nullable();
            $table->string('image')->nullable();
            $table->string('url')->nullable();
            $table->timestamps();

            $table->unique(['user_email', 'type', 'target_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favorites');
    }
};
