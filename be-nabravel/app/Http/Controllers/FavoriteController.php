<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Favorite;
use App\Models\Article;
use App\Models\Hotel;

class FavoriteController extends Controller
{
    public function getFavorites(Request $request)
    {
        $email = $request->input('user_email');
        if (!$email) return response()->json([]);

        $favorites = Favorite::where('user_email', $email)->get();
        $validFavorites = [];

        foreach ($favorites as $fav) {
            if ($fav->type === 'article') {
                $exists = Article::where('slug', $fav->target_id)->exists();
                if (!$exists) {
                    $fav->delete();
                    continue;
                }
            } else if ($fav->type === 'hotel') {
                $exists = Hotel::where('slug', $fav->target_id)->exists();
                if (!$exists) {
                    $fav->delete();
                    continue;
                }
            } else if ($fav->type === 'tour') {
                $exists = \App\Models\Tour::where('tour_id', $fav->target_id)->exists();
                if (!$exists) {
                    $fav->delete();
                    continue;
                }
            }
            $validFavorites[] = $fav;
        }

        return response()->json($validFavorites);
    }

    public function toggleFavorite(Request $request)
    {
        $email = $request->input('user_email');
        if (!$email) return response()->json(['error' => 'Missing email'], 400);

        $fav = Favorite::where('user_email', $email)
            ->where('type', $request->input('type'))
            ->where('target_id', $request->input('target_id'))
            ->first();

        if ($fav) {
            $fav->delete();
            return response()->json(['status' => 'removed']);
        } else {
            Favorite::create([
                'user_email' => $email,
                'type' => $request->input('type'),
                'target_id' => $request->input('target_id'),
                'title' => $request->input('title'),
                'image' => $request->input('image'),
                'url' => $request->input('url'),
            ]);
            return response()->json(['status' => 'added']);
        }
    }
}
