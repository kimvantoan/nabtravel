<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'hotel_slug',
        'user_name',
        'user_email',
        'user_avatar',
        'rating',
        'content',
    ];
}
