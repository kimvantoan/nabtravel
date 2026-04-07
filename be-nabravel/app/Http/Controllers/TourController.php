<?php

namespace App\Http\Controllers;

use App\Models\Tour;
use Illuminate\Http\Request;

class TourController extends Controller
{
    public function index(Request $request)
    {
        $limit = (int) $request->input('limit', 10);
        $skip = (int) $request->input('skip', 0);
        $search = $request->input('q', '');
        $sort = $request->input('sort', 'recommended');

        $query = Tour::query();
        
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('name_en', 'like', "%{$search}%")
                  ->orWhere('name_vi', 'like', "%{$search}%")
                  ->orWhere('locations_applied', 'like', "%{$search}%");
            });
        }

        $duration = $request->input('duration', '');
        if (!empty($duration) && $duration !== 'all') {
            // duration_days column has been removed. Filtering logic should be updated later
            // if ($duration === '1-3') {
            //     $query->whereBetween('duration_days', [1, 3]);
            // } elseif ($duration === '4-7') {
            //     $query->whereBetween('duration_days', [4, 7]);
            // } elseif ($duration === '8+') {
            //     $query->where('duration_days', '>=', 8);
            // }
        }

        $destinations = $request->input('destinations', '');
        if (!empty($destinations)) {
            $destArray = explode(',', $destinations);
            $query->where(function($q) use ($destArray) {
                foreach ($destArray as $dest) {
                    $q->orWhere('locations_applied', 'like', '%' . trim($dest) . '%');
                }
            });
        }

        $priceRanges = $request->input('price_ranges', '');
        if (!empty($priceRanges)) {
            $ranges = explode(',', $priceRanges);
            $query->where(function($q) use ($ranges) {
                foreach ($ranges as $range) {
                    if ($range === 'under_5') $q->orWhere('price_vnd', '<=', 5000000);
                    if ($range === '5_10') $q->orWhereBetween('price_vnd', [5000001, 10000000]);
                    if ($range === '10_20') $q->orWhereBetween('price_vnd', [10000001, 20000000]);
                    if ($range === '20_40') $q->orWhereBetween('price_vnd', [20000001, 40000000]);
                    if ($range === '40_70') $q->orWhereBetween('price_vnd', [40000001, 70000000]);
                    if ($range === 'over_70') $q->orWhere('price_vnd', '>=', 70000001);
                }
            });
        }

        switch ($sort) {
            case 'priceLowToHigh':
                $query->orderBy('price_vnd', 'asc');
                break;
            case 'priceHighToLow':
                $query->orderBy('price_vnd', 'desc');
                break;
            case 'topReviewed':
                $query->orderBy('total_reviews', 'desc');
                break;
            case 'recommended':
            default:
                $query->orderByRaw('(rating * total_reviews) DESC');
                break;
        }

        $totalCount = $query->count();
        $tours = $query->skip($skip)->limit($limit)->get();

        $formattedTours = $tours->map(function ($tour) {
            return [
                'id' => $tour->tour_id,
                'locations_applied' => $tour->locations_applied,
                'name' => [
                    'en' => $tour->name_en,
                    'vi' => $tour->name_vi
                ],
                'priceVND' => $tour->price_vnd,
                'rating' => $tour->rating,
                'totalReviews' => $tour->total_reviews,
                'photoUrl' => $tour->local_photo_path ? (url($tour->local_photo_path)) : $tour->photo_url,
                'shortDescription' => [
                    'en' => $tour->description_en,
                    'vi' => $tour->description_vi
                ]
            ];
        });

        // Get Top Destinations Dynamically
        $allLocs = \App\Models\Tour::pluck('locations_applied')->toArray();
        $locCounts = [];
        foreach ($allLocs as $locStr) {
            $parts = explode(' - ', $locStr);
            foreach ($parts as $p) {
                $p = trim($p);
                if (!empty($p)) {
                    $locCounts[$p] = ($locCounts[$p] ?? 0) + 1;
                }
            }
        }
        arsort($locCounts); // sort highest count first
        $topDestinations = array_slice(array_keys($locCounts), 0, 15);

        $aggregates = [
            'price' => [
                'under_5' => \App\Models\Tour::where('price_vnd', '<=', 5000000)->count(),
                '5_10' => \App\Models\Tour::whereBetween('price_vnd', [5000001, 10000000])->count(),
                '10_20' => \App\Models\Tour::whereBetween('price_vnd', [10000001, 20000000])->count(),
                '20_40' => \App\Models\Tour::whereBetween('price_vnd', [20000001, 40000000])->count(),
                '40_70' => \App\Models\Tour::whereBetween('price_vnd', [40000001, 70000000])->count(),
                'over_70' => \App\Models\Tour::where('price_vnd', '>=', 70000001)->count(),
            ],
            'destinations' => $topDestinations
        ];

        return response()->json([
            'tours' => $formattedTours,
            'total' => $totalCount,
            'skip' => $skip,
            'limit' => $limit,
            'hasMore' => ($skip + $limit) < $totalCount,
            'aggregates' => $aggregates
        ]);
    }

    public function show($slug)
    {
        $tour = Tour::with('detail')->where('tour_id', $slug)->firstOrFail();
        
        $formatted = [
            'id' => $tour->tour_id,
            'locations_applied' => $tour->locations_applied,
            'destinations' => $tour->destinations_json,
            'name' => [
                'en' => $tour->name_en,
                'vi' => $tour->name_vi
            ],
            'shortDescription' => [
                'en' => $tour->description_en,
                'vi' => $tour->description_vi
            ],
            'priceVND' => $tour->price_vnd,
            'originalPriceVND' => $tour->original_price_vnd,
            'rating' => $tour->rating,
            'totalReviews' => $tour->total_reviews,
            'photoUrl' => $tour->local_photo_path ? (url($tour->local_photo_path)) : $tour->photo_url,
            
            // From detail table (scraped data)
            'itinerary' => $tour->detail ? $tour->detail->itinerary_json : null,
            'highlights' => $tour->detail ? $tour->detail->highlights_json : null,
            'inclusions' => $tour->detail ? $tour->detail->inclusions_json : null,
            'exclusions' => $tour->detail ? $tour->detail->exclusions_json : null,
            'policies' => $tour->detail ? $tour->detail->policies_json : null,
            'faqs' => $tour->detail ? $tour->detail->faqs_json : null,
            'prices' => $tour->detail ? $tour->detail->prices_json : null,
            'gallery' => ($tour->detail && $tour->detail->gallery_json && is_array($tour->detail->gallery_json)) 
                         ? array_map(function($path) { 
                             $clean = ltrim(str_replace(['/images/tours/', 'images/tours/'], 'storage/tours/', $path), '/');
                             return url($clean); 
                         }, $tour->detail->gallery_json) 
                         : null,
            'tour_type' => $tour->detail ? $tour->detail->tour_type : null,
            'duration_text' => $tour->detail ? $tour->detail->duration_text : null,
            'group_size' => $tour->detail ? $tour->detail->group_size : null,
            'suitable_for' => $tour->detail ? $tour->detail->suitable_for : null,
            'themes' => $tour->detail ? $tour->detail->themes : null,
            'meals_summary' => $tour->detail ? $tour->detail->meals_summary : null,
            'operator' => $tour->detail ? $tour->detail->operated_by : null,
        ];
        
        return response()->json($formatted);
    }
}
