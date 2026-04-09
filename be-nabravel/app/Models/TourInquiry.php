<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TourInquiry extends Model
{
    use HasFactory;

    protected $fillable = [
        'tour_id',
        'adults',
        'children',
        'infants',
        'arrival_date',
        'accommodations',
        'gender',
        'full_name',
        'email',
        'phone_number',
        'country',
        'city',
        'social_media',
        'special_requirements',
    ];
}
