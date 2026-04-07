<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TourDetail extends Model
{
    protected $fillable = [
        'tour_id',
        'itinerary_json',
        'inclusions_json',
        'exclusions_json',
        'highlights_json',
        'tour_type',
        'duration_text',
        'group_size',
        'suitable_for',
        'themes',
        'meals_summary',
        'gallery_json',
        'policies_json',
        'faqs_json',
        'prices_json',
        'route_map_url'
    ];

    protected $casts = [
        'itinerary_json' => 'array',
        'inclusions_json' => 'array',
        'exclusions_json' => 'array',
        'highlights_json' => 'array',
        'gallery_json' => 'array',
        'policies_json' => 'array',
        'faqs_json' => 'array',
        'prices_json' => 'array',
    ];
}
