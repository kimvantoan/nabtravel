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
        $hotels = Hotel::all();

        $formatted = $hotels->map(function ($h) {
            $ratingNum = $h->rating ? (float)$h->rating : 8.0;
            $reviewWord = 'Tuyệt vời';
            if ($ratingNum >= 9.0) $reviewWord = 'Xuất sắc';
            else if ($ratingNum >= 8.5) $reviewWord = 'rất tốt';

            $img = $h->image;
            if ($h->photos && count($h->photos) > 0) {
               $img = str_starts_with($h->photos[0], '/') ? url('/') . $h->photos[0] : $h->photos[0];
            }

            return [
                'id' => $h->rapid_id ?? $h->id,
                'slug' => $h->slug,
                'name' => $h->name_vi,
                'image' => $img,
                'location' => $h->location_vi,
                'rating' => $ratingNum,
                'reviews' => $h->reviews ?? 100,
                'reviewWord' => $reviewWord,
                'price' => $h->price ?? $h->agoda_price ?? 1500000,
                'stars' => 4,
                'propertyType' => 'Khách sạn',
                'priceLevel' => 'Đa dạng',
                'neighborhood' => $h->neighborhood ?? "Khu vực trung tâm",
                'amenities' => ["WiFi miễn phí", "Điều hòa nhiệt độ"],
                'source_url' => $h->booking_url ?? $h->agoda_url
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
                'name'           => $h->name_vi,
                'image'          => $h->image,
                'location'       => $h->location_vi,
                'rating'         => $ratingNum,
                'reviews'        => $h->reviews ?? 100,
                'reviewWord'     => $reviewWord,
                'price'          => $h->price ?? 1500000,
                'stars'          => $h->stars ?? 4,
                'propertyType'   => $h->property_type,
                'priceLevel'     => $h->price_level,
                'amenities'      => $h->amenities,
                'booking_id'     => $h->booking_id,
                'price_updated_at' => $h->price_updated_at ? $h->price_updated_at->toISOString() : null,
                'address'        => $h->address,
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
        $hotel = Hotel::with('detail')->where('slug', $slug)->first();

        if (!$hotel) {
            return response()->json(['error' => 'Not found'], 404);
        }

        $img = $hotel->image;
        if ($hotel->detail?->photos && count($hotel->detail->photos) > 0) {
            $img = str_starts_with($hotel->detail->photos[0], '/') ? url('/') . $hotel->detail->photos[0] : $hotel->detail->photos[0];
        }

        return response()->json([
            'id' => $hotel->rapid_id ?? $hotel->id,
            'slug' => $hotel->slug,
            'name' => $hotel->name_vi,
            'name_en' => $hotel->name_en,
            'name_vi' => $hotel->name_vi,
            'image' => $img,
            'location' => $hotel->location_vi,
            'rating' => $hotel->rating,
            'reviews' => $hotel->reviews,
            'price' => $hotel->price,
            'photos' => $hotel->detail?->photos ?? [],
            'description' => $hotel->detail?->overview_vi ?? null,
            'overview_en' => $hotel->detail?->overview_en ?? null,
            'overview_vi' => $hotel->detail?->overview_vi ?? null,
            'amenities' => $hotel->detail?->amenities_vi ?? [],
            'amenities_en' => $hotel->detail?->amenities_en ?? [],
            'amenities_vi' => $hotel->detail?->amenities_vi ?? [],
            'latest_reviews' => $hotel->detail?->latest_reviews ?? [],
            'booking_url' => $hotel->booking_url,
            'agoda_price' => $hotel->agoda_price,
            'agoda_url' => $hotel->agoda_url
        ]);
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
            $detail = \App\Models\HotelDetail::firstOrCreate(['hotel_id' => $hotel->id]);
            if (isset($data['latest_reviews'])) {
                $detail->latest_reviews = $data['latest_reviews'];
                $detail->save();
            }
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
            'agoda_id' => 'nullable|string',
            'price' => 'nullable|numeric',
            'agoda_price' => 'nullable|numeric',
        ]);

        $query = Hotel::query();
        
        if (!empty($data['name'])) {
            $query->where('name', $data['name']);
        } elseif (!empty($data['booking_id'])) {
            $query->where('booking_id', $data['booking_id']);
        } elseif (!empty($data['agoda_id'])) {
            $query->where('agoda_id', $data['agoda_id']);
        } else {
            return response()->json(['error' => 'Need name, booking_id, or agoda_id'], 400);
        }

        $hotel = $query->first();

        if ($hotel) {
            $updateData = [];

            if (isset($data['price'])) {
                $updateData['price'] = $data['price'];
                $updateData['price_updated_at'] = now();
            }

            if (isset($data['agoda_price'])) {
                $updateData['agoda_price'] = $data['agoda_price'];
                $updateData['price_updated_at'] = now();
            }
            
            if (!empty($data['booking_id']) && empty($hotel->booking_id)) {
                $updateData['booking_id'] = $data['booking_id'];
            }

            if (!empty($data['agoda_id']) && empty($hotel->agoda_id)) {
                $updateData['agoda_id'] = $data['agoda_id'];
            }

            if (!empty($updateData)) {
                $hotel->update($updateData);
            }

            return response()->json([
                'message' => 'Price synced successfully', 
                'price_updated_at' => $hotel->price_updated_at
            ]);
        }

        return response()->json(['error' => 'Hotel not found'], 404);
    }
}
