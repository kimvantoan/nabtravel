<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'content',
        'meta_description',
        'thumbnail_url',
        'hotel_ids',
        'status',
        'is_ai_generated',
        'author_name',
    ];

    protected static function booted()
    {
        static::creating(function ($article) {
            if (empty($article->author_name)) {
                $faker = \Faker\Factory::create('vi_VN');
                $article->author_name = $faker->lastName . ' ' . $faker->firstName;
            }
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'hotel_ids' => 'json',
        ];
    }
}
