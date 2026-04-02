<?php

namespace App\Http\Controllers;

use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class HotelController extends Controller
{
    /**
     * API API: Lấy list Hotel cho Frontend
     */
    public function index()
    {
        // Trả về tất cả hotel, có thể phân trang sau
        $hotels = Hotel::all();

        // Format lại giống lúc frontend trả về
        $formatted = $hotels->map(function ($h) {
            $ratingNum = $h->rating ? (float)$h->rating : 4.0;
            $reviewWord = 'good';
            if ($ratingNum >= 4.5) $reviewWord = 'excellent';
            else if ($ratingNum >= 4.0) $reviewWord = 'veryGood';

            return [
                'id' => $h->rapid_id,
                'slug' => $h->slug,
                'name' => $h->name,
                'image' => $h->image,
                'location' => $h->location,
                'rating' => $ratingNum,
                'reviews' => $h->reviews ?? 100,
                'reviewWord' => $reviewWord,
                'price' => $h->price ?? 1500000,
                'stars' => $h->stars ?? 4,
                'propertyType' => $h->property_type,
                'priceLevel' => $h->price_level,
                'neighborhood' => $h->neighborhood,
                'amenities' => $h->amenities,
                'booking_id'     => $h->booking_id,
                'price_updated_at' => $h->price_updated_at ? $h->price_updated_at->toISOString() : null,
                'address'        => $h->address,
                'latitude'       => $h->latitude,
                'longitude'      => $h->longitude
            ];
        });

        return response()->json($formatted);
    }

    /**
     * API: Lấy Top Hotels chất lượng cao nhất cho Homepage
     */
    public function topHotels()
    {
        $hotels = Hotel::where('rating', '>=', 4.3)
            ->where('reviews', '>=', 100)
            ->whereNotNull('image')
            ->orderByRaw('(rating * LOG(reviews + 1)) DESC') // Wilson Score simplified
            ->limit(12)
            ->get();

        $formatted = $hotels->map(function ($h) {
            $ratingNum = $h->rating ? (float)$h->rating : 4.0;
            $reviewWord = 'good';
            if ($ratingNum >= 4.5) $reviewWord = 'excellent';
            else if ($ratingNum >= 4.0) $reviewWord = 'veryGood';

            return [
                'id'             => $h->rapid_id,
                'slug'           => $h->slug,
                'name'           => $h->name,
                'image'          => $h->image,
                'location'       => $h->location,
                'rating'         => $ratingNum,
                'reviews'        => $h->reviews ?? 100,
                'reviewWord'     => $reviewWord,
                'price'          => $h->price ?? 1500000,
                'stars'          => $h->stars ?? 4,
                'propertyType'   => $h->property_type,
                'priceLevel'     => $h->price_level,
                'neighborhood'   => $h->neighborhood,
                'amenities'      => $h->amenities,
                'booking_id'     => $h->booking_id,
                'price_updated_at' => $h->price_updated_at ? $h->price_updated_at->toISOString() : null,
                'address'        => $h->address,
                'latitude'       => $h->latitude,
                'longitude'      => $h->longitude
            ];
        });

        return response()->json($formatted);
    }

    /**
     * Đồng bộ dữ liệu RapidAPI -> MySQL
     */
    public function sync(Request $request)
    {
        $apiKey = env('RAPID_API_KEY');
        if (!$apiKey) {
            return response()->json(['error' => 'Thiếu RAPID_API_KEY'], 500);
        }

        $queries = [
            "Da Nang Resort", "Nha Trang Hotel", "Phu Quoc Resort", 
            "Hanoi Luxury Hotel", "Ho Chi Minh Hotel", "Sa Pa Boutique",
            "Da Lat Hotel", "Hoi An Hotel"
        ];
        
        $syncedCount = 0;

        foreach ($queries as $q) {
            try {
                $response = Http::withOptions(['verify' => false])->withHeaders([
                    'X-RapidAPI-Key' => $apiKey,
                    'X-RapidAPI-Host' => 'travel-advisor.p.rapidapi.com'
                ])->get('https://travel-advisor.p.rapidapi.com/locations/search', [
                    'query' => $q
                ]);

                if ($response->successful()) {
                    $results = $response->json('data') ?? [];
                    $lodgings = array_filter($results, function($item) {
                        return isset($item['result_type']) && $item['result_type'] === 'lodging';
                    });

                    // Lọc trùng theo location_id nhanh
                    $uniqueMap = [];
                    foreach ($lodgings as $l) {
                        $obj = $l['result_object'];
                        if (isset($obj['location_id']) && !isset($uniqueMap[$obj['location_id']])) {
                            $uniqueMap[$obj['location_id']] = $obj;
                        }
                    }

                    foreach ($uniqueMap as $locationId => $h) {
                        $nameStr = $h['name'] ?? "";
                        if (empty($nameStr)) continue;

                        $slugBase = Str::slug($nameStr);
                        $slug = $slugBase . '-' . $locationId;

                        // Tính toán giá và thuộc tính như logic ở frontend
                        $isLuxury = preg_match('/(luxury|resort|spa|5 star|intercontinental|vinpearl|hyatt|marriott|sheraton)/i', $nameStr);
                        $stars = $isLuxury ? 5 : (rand(1, 10) > 4 ? 4 : 3);
                        
                        $price = 1500000;
                        $randomFactor = mt_rand() / mt_getrandmax();
                        $priceLevelRaw = $h['price_level'] ?? '';
                        if (str_contains($priceLevelRaw, "$$$$")) $price = 3000000 + floor($randomFactor * 7000000);
                        else if (str_contains($priceLevelRaw, "$$$")) $price = 1200000 + floor($randomFactor * 1800000);
                        else if (str_contains($priceLevelRaw, "$$")) $price = 500000 + floor($randomFactor * 700000);
                        else $price = 200000 + floor($randomFactor * 300000);
                        
                        $price = round($price / 50000) * 50000;

                        $propertyType = "Khác";
                        if (!empty($h['establishment_types'])) {
                            $propertyType = $h['establishment_types'][0]['name'];
                        } else {
                            if (stripos($nameStr, "resort") !== false) $propertyType = "Resorts";
                            else if (stripos($nameStr, "villa") !== false || stripos($nameStr, "homestay") !== false) $propertyType = "Villas & Homestays";
                            else $propertyType = "Hotels";
                        }

                        $priceLevel = "Các mức giá khác";
                        if (str_contains($priceLevelRaw, "$$$$")) $priceLevel = "$$$$ (Thượng lưu)";
                        else if (str_contains($priceLevelRaw, "$$$")) $priceLevel = "$$$ (Tầm trung)";
                        else if (str_contains($priceLevelRaw, "$$") || str_contains($priceLevelRaw, "$")) $priceLevel = "$ - $$ (Bình dân)";

                        $neighborhood = !empty($h['location_string']) ? trim(explode(",", $h['location_string'])[0]) : "Khu vực chung";

                        $image = $h['photo']['images']['original']['url'] ?? 
                                 $h['photo']['images']['large']['url'] ?? 
                                 "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop";

                        $reviewsNum = null;
                        if (!empty($h['num_reviews'])) {
                            $reviewsNum = (int) preg_replace('/[^0-9]/', '', $h['num_reviews']);
                        }
                        if (!$reviewsNum) $reviewsNum = rand(100, 1100);

                        $rating = isset($h['rating']) ? (float)$h['rating'] : 4.0;
                        if ($rating < 3.5) continue; // Chỉ sync những hotel tốt

                        Hotel::updateOrCreate(
                            ['rapid_id' => $locationId],
                            [
                                'slug' => $slug,
                                'name' => $nameStr,
                                'image' => $image,
                                'location' => $h['location_string'] ?? 'Vietnam',
                                'address' => $h['address_obj']['address_string'] ?? $h['address'] ?? null,
                                'latitude' => isset($h['latitude']) ? (float)$h['latitude'] : null,
                                'longitude' => isset($h['longitude']) ? (float)$h['longitude'] : null,
                                'rating' => $rating,
                                'reviews' => $reviewsNum,
                                'price' => $price,
                                'stars' => $stars,
                                'property_type' => $propertyType,
                                'price_level' => $priceLevel,
                                'neighborhood' => $neighborhood,
                                'amenities' => isset($h['amenities']) ? array_column(array_slice($h['amenities'], 0, 5), 'v') : null,
                            ]
                        );
                        $syncedCount++;
                    }
                }
            } catch (\Exception $e) {
                // Tiếp tục vòng lặp nếu lỗi 1 query
            }
        }

        return response()->json(['message' => "Đồng bộ thành công $syncedCount khách sạn từ RapidAPI"]);
    }

    /**
     * API API: Trả về thông tin chi tiết một Khách Sạn (nếu đã có trong DB)
     */
    public function show($slug)
    {
        $hotel = Hotel::where('slug', $slug)->first();
        if (!$hotel) {
            return response()->json(['error' => 'Not found'], 404);
        }
        return response()->json($hotel);
    }

    /**
     * API API: Nhận dữ liệu cực nặng từ quá trình Lazy Fetch của Next.js để nhét vào DB
     */
    public function syncDetails(Request $request)
    {
        $data = $request->validate([
            'slug' => 'required|string',
            'description' => 'nullable|string',
            'photos' => 'nullable|array',
            'latest_reviews' => 'nullable|array'
        ]);

        $hotel = Hotel::where('slug', $data['slug'])->first();
        if ($hotel) {
            $hotel->update([
                'description' => $data['description'] ?? $hotel->description,
                'photos' => $data['photos'] ?? $hotel->photos,
                'latest_reviews' => $data['latest_reviews'] ?? $hotel->latest_reviews,
            ]);
            return response()->json(['message' => 'Details synced globally']);
        }

        return response()->json(['error' => 'Hotel not found'], 404);
    }

    /**
     * API API: Nhận giá realtime từ Next.js và cập nhật DB
     */
    public function syncPrice(Request $request)
    {
        $data = $request->validate([
            'name' => 'nullable|string',
            'booking_id' => 'nullable|string',
            'price' => 'required|numeric'
        ]);

        $query = Hotel::query();
        
        if (!empty($data['name'])) {
            $query->where('name', $data['name']);
        } elseif (!empty($data['booking_id'])) {
            $query->where('booking_id', $data['booking_id']);
        } else {
            return response()->json(['error' => 'Need name or booking_id'], 400);
        }

        $hotel = $query->first();

        if ($hotel) {
            $updateData = [
                'price' => $data['price'],
                'price_updated_at' => now(),
            ];
            
            if (!empty($data['booking_id']) && empty($hotel->booking_id)) {
                $updateData['booking_id'] = $data['booking_id'];
            }

            $hotel->update($updateData);

            return response()->json([
                'message' => 'Price synced successfully', 
                'price_updated_at' => $hotel->price_updated_at
            ]);
        }

        return response()->json(['error' => 'Hotel not found'], 404);
    }
}
