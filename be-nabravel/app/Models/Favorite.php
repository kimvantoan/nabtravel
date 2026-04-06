<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    protected $fillable = ['user_email', 'type', 'target_id', 'title', 'image', 'url'];
}
