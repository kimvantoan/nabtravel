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
            $table->dropColumn([
                'exclusions_json',
                'tour_type',
                'duration_text',
                'suitable_for',
                'themes',
                'route_map_url'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tour_details', function (Blueprint $table) {
            $table->json('exclusions_json')->nullable();
            $table->string('tour_type')->nullable();
            $table->string('duration_text')->nullable();
            $table->string('suitable_for')->nullable();
            $table->string('themes')->nullable();
            $table->string('route_map_url')->nullable();
        });
    }
};
