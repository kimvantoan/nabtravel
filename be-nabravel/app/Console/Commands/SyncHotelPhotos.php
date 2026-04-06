<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Hotel;
use Illuminate\Support\Facades\Http;

class SyncHotelPhotos extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'hotels:sync-photos {--force : Force sync all hotels even if they already have photos}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch hotel photos from hotels-com-provider API and save them to the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $apiKey = env('HOTELS_COM_API_KEY', '98deebd14bmshfe2c94696bb0db1p1b634bjsnd1dc46b841f3');
        $host = 'hotels-com-provider.p.rapidapi.com';

        $query = Hotel::query();
        if (!$this->option('force')) {
            $query->whereNull('photos')->orWhereJsonLength('photos', 0);
        }

        $hotels = $query->get();
        
        $this->info("Bắt đầu lấy ảnh cho " . $hotels->count() . " khách sạn...");
        $bar = $this->output->createProgressBar($hotels->count());
        $bar->start();

        $successCount = 0;

        foreach ($hotels as $hotel) {
            try {
                // Bước 1: Tìm hotel_id thông qua tên khách sạn
                $searchQuery = $hotel->name . ' ' . $hotel->location;
                $searchResponse = Http::withOptions(['verify' => false])->withHeaders([
                    'x-rapidapi-key' => $apiKey,
                    'x-rapidapi-host' => $host,
                ])->get("https://$host/v2/regions", [
                    'query' => $searchQuery,
                    'domain' => 'VN',
                    'locale' => 'vi_VN'
                ]);

                $hotelId = null;
                if ($searchResponse->successful() && isset($searchResponse['data'])) {
                    foreach ($searchResponse['data'] as $item) {
                        if (isset($item['@type']) && $item['@type'] === 'gaiaHotelResult' && !empty($item['hotelId'])) {
                            $hotelId = $item['hotelId'];
                            break;
                        }
                    }
                }

                if ($hotelId) {
                    // Bước 2: Dùng hotel_id kéo danh sách ảnh chi tiết
                    $detailsResponse = Http::withOptions(['verify' => false])->withHeaders([
                        'x-rapidapi-key' => $apiKey,
                        'x-rapidapi-host' => $host,
                    ])->get("https://$host/v2/hotels/details", [
                        'domain' => 'VN',
                        'locale' => 'vi_VN',
                        'hotel_id' => $hotelId
                    ]);

                    if ($detailsResponse->successful()) {
                        $images = $detailsResponse['propertyGallery']['images'] ?? [];
                        $photoUrls = [];
                        
                        foreach (array_slice($images, 0, 15) as $img) {
                            if (!empty($img['image']['url'])) {
                                // Xóa tham số resize để lấy ảnh phân giải cao nhất
                                $rawUrl = explode('?', $img['image']['url'])[0];
                                $photoUrls[] = $rawUrl;
                            }
                        }

                        if (!empty($photoUrls)) {
                            // Lưu vào database
                            $hotel->photos = $photoUrls;
                            // Cập nhật luôn cả ảnh bìa (image) nếu ảnh hiện tại là mặc định hoặc không đẹp
                            if (str_contains($hotel->image, 'images.unsplash.com')) {
                                $hotel->image = $photoUrls[0];
                            }
                            $hotel->save();
                            $successCount++;
                        }
                    }
                }
            } catch (\Exception $e) {
                // Bỏ qua khách sạn rớt luồng mạng để chạy tiếp
            }
            
            $bar->advance();
            usleep(500000); // 0.5s pause to prevent rapid API limits (2 per sec max)
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("Đã cào ảnh thành công cho $successCount khách sạn (Hotels.com API)!");
    }
}
