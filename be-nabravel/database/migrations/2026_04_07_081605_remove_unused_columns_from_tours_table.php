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
        Schema::table('tours', function (Blueprint $table) {
            $table->dropColumn([
                'city_ufi', 
                'category_slug', 
                'duration_days', 
                'duration_nights', 
                'itinerary_json', 
                'cancellation_policy'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tours', function (Blueprint $table) {
            $table->integer('city_ufi')->nullable();
            $table->string('category_slug')->nullable();
            $table->unsignedTinyInteger('duration_days')->nullable();
            $table->unsignedTinyInteger('duration_nights')->nullable();
            $table->longText('itinerary_json')->nullable();
            $table->text('cancellation_policy')->nullable();
        });
    }
};
