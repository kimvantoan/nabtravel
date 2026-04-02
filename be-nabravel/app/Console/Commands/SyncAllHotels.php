<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Hotel;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SyncAllHotels extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'hotels:sync-all';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync hotels for 63 provinces and tourist hotspots of Vietnam';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $apiKey = env('RAPID_API_KEY');
        if (!$apiKey) {
            $this->error('Thiếu RAPID_API_KEY trong file .env');
            return;
        }

        $queries = [
            // North
            "Hanoi Hotel", "Hanoi Luxury Hotel", "Sa Pa Resort", "Sa Pa Boutique", 
            "Ha Long Cruise", "Ha Long Resort", "Ninh Binh Homestay", "Tam Dao Hotel", 
            "Moc Chau Homestay", "Ha Giang Homestay", "Hai Phong Hotel", "Cat Ba Resort", 
            "Lang Son Hotel", "Lao Cai Hotel", "Thai Nguyen Hotel", "Hoa Binh Resort", "Mai Chau Homestay",
            // Center
            "Da Nang Resort", "Da Nang Hotel", "Hoi An Resort", "Hoi An Boutique", 
            "Hue Hotel", "Hue Resort", "Phong Nha Ke Bang Hotel", "Dong Hoi Hotel",
            "Vinh Hotel", "Thanh Hoa Hotel", "Sam Son Resort", "Quy Nhon Resort", 
            "Quy Nhon Hotel", "Phu Yen Hotel", "Tuy Hoa Resort", "Nha Trang Hotel", 
            "Nha Trang Resort", "Cam Ranh Resort", "Da Lat Hotel", "Da Lat Resort",
            "Mui Ne Resort", "Phan Thiet Hotel", "Ninh Thuan Resort", "Buon Ma Thuot Hotel", "Pleiku Hotel",
            // South
            "Ho Chi Minh Hotel", "Ho Chi Minh Luxury Hotel", "Phu Quoc Resort", "Phu Quoc Hotel",
            "Con Dao Resort", "Vung Tau Hotel", "Vung Tau Resort", "Ho Tram Resort",
            "Can Tho Hotel", "Ben Tre Homestay", "Ca Mau Hotel", "Chau Doc Hotel", "Soc Trang Hotel",
            "Phan Rang Resort", "Tay Ninh Hotel", "Binh Duong Hotel", "Dong Nai Hotel"
        ];

        $this->info("Bắt đầu đồng bộ " . count($queries) . " khu vực tại Việt Nam...");
        $bar = $this->output->createProgressBar(count($queries));
        $bar->start();

        $syncedCount = 0;

        foreach ($queries as $q) {
            try {
                $response = Http::withOptions(['verify' => false])->withHeaders([
                    'X-RapidAPI-Key' => $apiKey,
                    'X-RapidAPI-Host' => 'travel-advisor.p.rapidapi.com'
                ])->get('https://travel-advisor.p.rapidapi.com/locations/search', [
                    'query' => $q,
                    'limit' => 20
                ]);

                if ($response->successful()) {
                    $results = $response->json('data') ?? [];
                    // Log array to file if needed for debug, but we just filter
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
                        $isLuxury = preg_match('/(luxury|resort|spa|5 star|intercontinental|vinpearl|hyatt|marriott|sheraton|pullman|novotel|melia)/i', $nameStr);
                        $stars = $isLuxury ? 5 : (rand(1, 10) > 4 ? 4 : 3);
                        
                        $price = 1500000;
                        $randomFactor = mt_rand() / mt_getrandmax();
                        $priceLevelRaw = $h['price_level'] ?? '';
                        if (str_contains($priceLevelRaw, "$$$$")) $price = 3000000 + floor($randomFactor * 7000000);
                        else if (str_contains($priceLevelRaw, "$$$")) $price = 1200000 + floor($randomFactor * 1800000);
                        else if (str_contains($priceLevelRaw, "$$")) $price = 500000 + floor($randomFactor * 700000);
                        else $price = 200000 + floor($randomFactor * 300000);
                        
                        $price = round($price / 50000) * 50000;

                        $propertyType = "Hotels";
                        if (!empty($h['establishment_types'])) {
                            $propertyType = $h['establishment_types'][0]['name'];
                        } else {
                            if (stripos($nameStr, "resort") !== false) $propertyType = "Resorts";
                            else if (stripos($nameStr, "villa") !== false || stripos($nameStr, "homestay") !== false) $propertyType = "Villas & Homestays";
                        }

                        $priceLevel = "$$$ (Tầm trung)";
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
                        if (!$reviewsNum) $reviewsNum = rand(50, 1100);

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
                // Ignore error and continue
            }

            $bar->advance();
            // Sleep to prevent RapidAPI rate limiting issues
            usleep(800000); // 0.8s
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("Đã đồng bộ thành công thêm $syncedCount khách sạn trên toàn quốc!");
    }
}
