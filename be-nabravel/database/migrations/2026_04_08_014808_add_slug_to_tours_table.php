<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('name_en');
        });

        $tours = DB::table('tours')->get();
        foreach ($tours as $tour) {
            $baseSlug = Str::slug($tour->name_en ?? 'tour');
            $slug = $baseSlug;
            $count = 1;
            while(DB::table('tours')->where('slug', $slug)->where('id', '!=', $tour->id)->exists()) {
                $slug = $baseSlug . '-' . $count;
                $count++;
            }
            DB::table('tours')->where('id', $tour->id)->update(['slug' => $slug]);
        }
        
        // Now make it unique
        Schema::table('tours', function (Blueprint $table) {
            $table->unique('slug');
        });
    }

    public function down(): void
    {
        Schema::table('tours', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn('slug');
        });
    }
};
