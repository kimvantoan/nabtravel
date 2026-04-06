<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Review;

class ReviewController extends Controller
{
    public function index($slug)
    {
        $reviews = Review::where('hotel_slug', $slug)->orderBy('created_at', 'desc')->get();
        return response()->json($reviews);
    }

    public function store(Request $request, $slug)
    {
        $request->validate([
            'user_name' => 'required|string',
            'user_email' => 'required|email',
            'rating' => 'required|integer|min:1|max:5',
            'content' => 'required|string|min:5'
        ]);

        $review = new Review();
        $review->hotel_slug = $slug;
        $review->user_name = $request->input('user_name');
        $review->user_email = $request->input('user_email');
        $review->user_avatar = $request->input('user_avatar');
        $review->rating = $request->input('rating');
        $review->content = $request->input('content');
        $review->save();

        return response()->json(['success' => true, 'review' => $review], 201);
    }
}
