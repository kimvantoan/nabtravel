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
        Schema::table('ta_hotels', function (Blueprint $table) {
            $table->unsignedInteger('agoda_price')->nullable();
            $table->text('agoda_url')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ta_hotels', function (Blueprint $table) {
            //
        });
    }
};
