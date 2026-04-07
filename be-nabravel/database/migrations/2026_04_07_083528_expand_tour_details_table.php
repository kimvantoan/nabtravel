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
            $table->string('tour_type')->nullable();
            $table->string('group_size')->nullable();
            $table->string('duration_text')->nullable();
            $table->string('meals_summary')->nullable();
            $table->string('suitable_for')->nullable();
            $table->string('themes')->nullable();
            $table->string('operated_by')->default('NabTravel');
            $table->string('route_map_url')->nullable();
            $table->json('gallery_json')->nullable();
            $table->json('policies_json')->nullable();
            $table->json('faqs_json')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tour_details', function (Blueprint $table) {
            $table->dropColumn([
                'tour_type',
                'group_size',
                'duration_text',
                'meals_summary',
                'suitable_for',
                'themes',
                'operated_by',
                'route_map_url',
                'gallery_json',
                'policies_json',
                'faqs_json'
            ]);
        });
    }
};
