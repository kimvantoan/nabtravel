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
        Schema::create('tour_inquiries', function (Blueprint $table) {
            $table->id();
            $table->string('tour_id')->index(); // tour string ID like BESTE...
            $table->integer('adults')->default(2);
            $table->integer('children')->default(0);
            $table->integer('infants')->default(0);
            $table->date('arrival_date')->nullable();
            $table->string('accommodations')->nullable();
            $table->string('gender', 10)->nullable();
            $table->string('full_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('country')->nullable();
            $table->string('city')->nullable();
            $table->string('social_media')->nullable();
            $table->text('special_requirements')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tour_inquiries');
    }
};
