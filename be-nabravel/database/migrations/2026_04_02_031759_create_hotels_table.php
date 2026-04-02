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
        Schema::create('hotels', function (Blueprint $table) {
            $table->id();
            $table->string('rapid_id')->unique();
            $table->string('slug')->unique();
            $table->string('name');
            $table->text('image')->nullable();
            $table->string('location')->nullable();
            $table->decimal('rating', 3, 1)->nullable();
            $table->integer('reviews')->nullable();
            $table->integer('price')->nullable();
            $table->integer('stars')->nullable();
            $table->string('property_type')->nullable();
            $table->string('price_level')->nullable();
            $table->string('neighborhood')->nullable();
            $table->json('amenities')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hotels');
    }
};
