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
            $table->string('slug')->unique(); // Unique slug for URL routing
            $table->string('rapid_id')->nullable(); // Removed unique constraint to avoid MD5 collisions
            $table->string('name_en')->nullable();
            $table->string('name_vi')->nullable();
            $table->string('location_en')->nullable();
            $table->string('location_vi')->nullable();
            $table->string('address')->nullable();
            $table->string('booking_id')->nullable();
            $table->text('booking_url')->nullable();
            $table->text('agoda_url')->nullable();
            $table->decimal('price', 15, 2)->nullable();
            $table->decimal('agoda_price', 15, 2)->nullable();
            $table->decimal('rating', 3, 2)->nullable();
            $table->integer('reviews')->nullable();
            $table->text('image')->nullable();
            $table->timestamp('price_updated_at')->nullable();
            $table->timestamps();
        });

        Schema::create('hotel_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained('hotels')->onDelete('cascade');
            $table->text('overview_en')->nullable();
            $table->text('overview_vi')->nullable();
            $table->json('amenities_en')->nullable();
            $table->json('amenities_vi')->nullable();
            $table->json('photos')->nullable();
            $table->json('latest_reviews')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hotel_details');
        Schema::dropIfExists('hotels');
    }
};
