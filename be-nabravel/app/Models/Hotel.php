<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hotel extends Model
{
    use HasFactory;

    protected $fillable = [
        'rapid_id',
        'slug',
        'name',
        'image',
        'location',
        'rating',
        'reviews',
        'price',
        'stars',
        'property_type',
        'price_level',
        'neighborhood',
        'amenities',
        'description',
        'photos',
        'latest_reviews',
        'booking_id',
        'agoda_id',
        'price_updated_at',
        'address',
        'latitude',
        'longitude',
        'agoda_price',
    ];

    protected function casts(): array
    {
        return [
            'amenities' => 'json',
            'photos' => 'json',
            'latest_reviews' => 'json',
            'rating' => 'decimal:1',
            'price_updated_at' => 'datetime',
        ];
    }
}
