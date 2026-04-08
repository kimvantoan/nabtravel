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
        Schema::create('ta_hotel_details', function (Blueprint $table) {
            $table->id();
            $table->string('ta_id')->unique();
            $table->text('overview_text')->nullable();
            $table->json('gallery_json')->nullable(); // Thường lưu các path local của ảnh
            $table->json('amenities_json')->nullable();
            $table->json('room_features_json')->nullable();
            $table->string('hotel_style')->nullable();
            $table->string('languages_spoken')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ta_hotel_details');
    }
};
