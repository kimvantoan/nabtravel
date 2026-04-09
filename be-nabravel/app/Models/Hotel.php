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
        'booking_id',
        'agoda_id',
        'agoda_price',
        'name_en',
        'name_vi',
        'location_en',
        'location_vi',
        'booking_url',
        'agoda_url',
    ];

    protected function casts(): array
    {
        return [
            'rating' => 'decimal:1',
        ];
    }

    public function detail()
    {
        return $this->hasOne(HotelDetail::class);
    }
}
