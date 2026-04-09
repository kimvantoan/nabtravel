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
        Schema::table('tour_details', function (Blueprint $table) {
            $table->json('itinerary_vi_json')->nullable();
            $table->json('inclusions_vi_json')->nullable();
            $table->json('highlights_vi_json')->nullable();
            $table->json('faqs_vi_json')->nullable();
            $table->json('policies_vi_json')->nullable();
            $table->json('prices_vi_json')->nullable();
            $table->string('group_size_vi')->nullable();
            $table->string('meals_summary_vi')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tour_details', function (Blueprint $table) {
            $table->dropColumn([
                'itinerary_vi_json',
                'inclusions_vi_json',
                'highlights_vi_json',
                'faqs_vi_json',
                'policies_vi_json',
                'prices_vi_json',
                'group_size_vi',
                'meals_summary_vi'
            ]);
        });
    }
};
