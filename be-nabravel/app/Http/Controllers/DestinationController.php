<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DestinationController extends Controller
{
    /**
     * Lấy danh sách điểm đến. Tự động gọi API thứ 3 nếu dữ liệu đã cũ hơn 30 ngày (hoặc chưa có).
     */
    public function index()
    {
        $targetCities = ["Hà Nội", "Đà Nẵng", "Nha Trang", "Đà Lạt", "Sa Pa", "Hội An"];
        
        $destinations = Destination::whereIn('name', $targetCities)->get();

        // Kiểm tra xem có cần sync không (Chưa có đủ data hoặc Cũ hơn 30 ngày, HOẶC bị thiếu ảnh do lỗi Rate Limit đợt trước)
        $needsSync = false;
        if ($destinations->count() < count($targetCities)) {
            $needsSync = true;
        } else {
            foreach ($destinations as $dest) {
                if (!$dest->last_synced_at || $dest->last_synced_at < now()->subDays(30) || empty($dest->image)) {
                    $needsSync = true;
                    break;
                }
            }
        }

        if ($needsSync) {
            $this->syncFromRapidAPI($targetCities);
            $destinations = Destination::whereIn('name', $targetCities)->get();
        }

        // Format lại dữ liệu cho Frontend Next.js
        $formatted = $destinations->map(function ($d) {
            return [
                'id' => (string) ($d->rapid_id ?? $d->id),
                'name' => $d->name,
                'image' => $d->image,
            ];
        });

        return response()->json($formatted);
    }

    private function syncFromRapidAPI($cities)
    {
        $apiKey = env('RAPID_API_KEY');
        if (!$apiKey) return;

        foreach ($cities as $city) {
            try {
                // Tối ưu Quota: Bỏ qua nếu đã có ảnh xịn rồi
                $existing = Destination::where('name', $city)->first();
                if ($existing && !empty($existing->image) && $existing->last_synced_at >= now()->subDays(30)) {
                    continue;
                }

                usleep(1500000); // Ngủ 1.5s để chắc chắn không bị block rate limit (1 req/sec)

                $searchQuery = \Illuminate\Support\Str::ascii($city) . ' Vietnam';

                $response = Http::withoutVerifying()->withHeaders([
                    'X-RapidAPI-Key' => $apiKey,
                    'X-RapidAPI-Host' => 'maps-data.p.rapidapi.com'
                ])->get('https://maps-data.p.rapidapi.com/searchmaps.php', [
                    'query' => $searchQuery,
                    'limit' => 5
                ]);

                if ($response->successful() && $response->json('status') === 'ok') {
                    $results = $response->json('data') ?? [];
                    $photo = null;
                    $rapidId = null;

                    foreach ($results as $place) {
                        if (isset($place['photos']) && count($place['photos']) > 0 && isset($place['photos'][0]['src'])) {
                            $photo = $place['photos'][0]['src'];
                            $rapidId = $place['business_id'] ?? null;
                            break;
                        }
                    }

                    if ($photo) {
                        // Google Maps photos often end with =w203-h... let's request a higher resolution
                        $photo = preg_replace('/=w\d+-h\d+-k-no/i', '=w1200-h800-k-no', $photo);
                        
                        Destination::updateOrCreate(
                            ['name' => $city],
                            [
                                'rapid_id' => $rapidId,
                                'image' => $photo,
                                'last_synced_at' => now()
                            ]
                        );
                        continue;
                    } else {
                        Log::warning("Maps Data trả về kết quả nhưng không có ảnh nào cho: " . $searchQuery);
                    }
                } else {
                    Log::error("Maps Data API lỗi " . $response->status() . " cho " . $city);
                }
                
                // Thuận theo ý user: NẾU không tìm thấy ảnh thì lưu NULL
                Destination::updateOrCreate(
                    ['name' => $city],
                    [
                        'image' => null, 
                        'last_synced_at' => now() 
                    ]
                );

            } catch (\Exception $e) {
                Log::error("Lỗi khi sync Destination $city qua Unsplash: " . $e->getMessage());
                Destination::updateOrCreate(
                    ['name' => $city],
                    [
                        'image' => null,
                        'last_synced_at' => now()
                    ]
                );
            }
        }
    }
}
