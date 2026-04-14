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
        Schema::table('articles', function (Blueprint $table) {
            $table->string('author_name')->nullable();
        });

        // Fake data
        $faker = \Faker\Factory::create('vi_VN');
        $articles = \Illuminate\Support\Facades\DB::table('articles')->get();
        foreach ($articles as $article) {
            \Illuminate\Support\Facades\DB::table('articles')
                ->where('id', $article->id)
                ->update(['author_name' => $faker->name()]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropColumn('author_name');
        });
    }
};
