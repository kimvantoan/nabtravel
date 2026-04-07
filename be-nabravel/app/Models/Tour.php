<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tour extends Model
{
    use HasFactory;

    protected $fillable = [
        'tour_id',
        'locations_applied',
        'destinations_json',
        'name_en',
        'name_vi',
        'description_en',
        'description_vi',
        'price_vnd',
        'original_price_vnd',
        'rating',
        'total_reviews',
        'photo_url',
        'local_photo_path',
        'source_url'
    ];

    protected $casts = [
        'destinations_json' => 'array',
    ];

    public function detail()
    {
        return $this->hasOne(TourDetail::class, 'tour_id', 'tour_id');
    }
}
