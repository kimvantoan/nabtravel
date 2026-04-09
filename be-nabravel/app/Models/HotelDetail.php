<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HotelDetail extends Model
{
    protected $fillable = [
        'hotel_id',
        'overview_en',
        'overview_vi',
        'amenities_en',
        'amenities_vi',
        'photos',
        'latest_reviews',
    ];

    protected function casts(): array
    {
        return [
            'amenities_en' => 'json',
            'amenities_vi' => 'json',
            'photos' => 'json',
            'latest_reviews' => 'json',
        ];
    }

    public function hotel()
    {
        return $this->belongsTo(Hotel::class);
    }
}
