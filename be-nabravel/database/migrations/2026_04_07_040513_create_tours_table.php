<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tours', function (Blueprint $table) {
            $table->id();
            $table->string('tour_id')->unique();
            $table->string('city_ufi')->nullable();
            
            $table->text('locations_applied')->nullable(); 
            $table->json('destinations_json')->nullable(); 
            
            $table->string('name_en')->nullable();
            $table->string('name_vi')->nullable();
            $table->text('description_en')->nullable();
            $table->text('description_vi')->nullable();
            
            $table->decimal('price_vnd', 15, 2)->default(0);
            $table->decimal('original_price_vnd', 15, 2)->nullable();
            
            $table->string('category_slug')->nullable();
            $table->integer('duration_days')->default(1);
            $table->integer('duration_nights')->default(0);
            
            $table->decimal('rating', 3, 1)->default(0);
            $table->integer('total_reviews')->default(0);
            
            $table->string('photo_url')->nullable();
            $table->string('local_photo_path')->nullable();
            $table->boolean('cancellation_policy')->default(false);
            $table->json('itinerary_json')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tours');
    }
};
