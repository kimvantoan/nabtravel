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
        Schema::create('tour_details', function (Blueprint $table) {
            $table->id();
            $table->string('tour_id')->unique();
            $table->json('itinerary_json')->nullable();
            $table->json('inclusions_json')->nullable();
            $table->json('exclusions_json')->nullable();
            $table->json('highlights_json')->nullable();
            $table->timestamps();

            // Foreign key to tours table
            // $table->foreign('tour_id')->references('tour_id')->on('tours')->onDelete('cascade');
            // Assuming tour_id matches type string of tours.tour_id
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tour_details');
    }
};
