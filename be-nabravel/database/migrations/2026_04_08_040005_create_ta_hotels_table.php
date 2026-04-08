<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ta_hotels', function (Blueprint $table) {
            $table->id();
            $table->string('ta_id')->unique();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('location')->nullable();
            $table->decimal('rating', 3, 1)->nullable();
            $table->integer('reviews')->nullable();
            $table->text('source_url')->nullable();
            $table->text('photo_url')->nullable();
            $table->string('local_photo_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ta_hotels');
    }
};
