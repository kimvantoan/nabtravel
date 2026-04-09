<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TourDetail extends Model
{
    protected $fillable = [
        'tour_id',
        'itinerary_json',
        'itinerary_vi_json',
        'inclusions_json',
        'inclusions_vi_json',
        'highlights_json',
        'highlights_vi_json',
        'group_size',
        'group_size_vi',
        'meals_summary',
        'meals_summary_vi',
        'gallery_json',
        'policies_json',
        'policies_vi_json',
        'faqs_json',
        'faqs_vi_json',
        'prices_json',
        'prices_vi_json',
    ];

    protected $casts = [
        'itinerary_json' => 'array',
        'itinerary_vi_json' => 'array',
        'inclusions_json' => 'array',
        'inclusions_vi_json' => 'array',
        'highlights_json' => 'array',
        'highlights_vi_json' => 'array',
        'gallery_json' => 'array',
        'policies_json' => 'array',
        'policies_vi_json' => 'array',
        'faqs_json' => 'array',
        'faqs_vi_json' => 'array',
        'prices_json' => 'array',
        'prices_vi_json' => 'array',
    ];
}
