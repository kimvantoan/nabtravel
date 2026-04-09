<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tour;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;

class SyncTours extends Command
{
    protected $signature = 'tours:sync';
    protected $description = 'Crawl latest multi-day package tours and download images to local storage';

    public function handle()
    {
        $this->info("Bắt đầu khởi chạy Bot thu thập dữ liệu Tour...");

        // 1. Chạy Node script để cào data thô từ HTML về JSON
        $nodeScriptPath = base_path('../scrapper_mapper.js');
        $jsonOutputPath = base_path('../all_tours_multilang_crawled.json');
        
        $this->info("Đang by-pass web firewall và cào data trực tiếp...");
        passthru("node " . escapeshellarg($nodeScriptPath));

        if (!file_exists($jsonOutputPath)) {
            $this->error("Không tìm thấy file JSON data. Quá trình cào có thể bị lỗi mạng.");
            return;
        }

        $jsonContent = file_get_contents($jsonOutputPath);
        $toursData = json_decode($jsonContent, true);

        if (!$toursData) {
            $this->error("Lỗi parse JSON.");
            return;
        }

        $this->info("Cào thành công " . count($toursData) . " tours. Tiến hành đồng bộ vào DB...");

        foreach ($toursData as $item) {
            $tour = Tour::updateOrCreate(
                ['tour_id' => $item['id']],
                [
                    'locations_applied' => $item['locations_applied'] ?? null,
                    'destinations_json' => explode(' - ', $item['locations_applied'] ?? ''),
                    'name_en' => $item['name']['en'] ?? null,
                    'name_vi' => $item['name']['vi'] ?? null,
                    'description_en' => $item['shortDescription']['en'] ?? null,
                    'description_vi' => $item['shortDescription']['vi'] ?? null,
                    'price_vnd' => $item['priceVND'] ?? 0,
                    'original_price_vnd' => ($item['priceVND'] ?? 0) * 1.15, // Tạo 15% discount ảo cho real-time deals
                    'rating' => $item['rating'] ?? 0,
                    'total_reviews' => $item['totalReviews'] ?? 0,
                    'source_url' => $item['source_url'] ?? null,
                    'photo_url' => $item['photoUrl'] ?? null,
                ]
            );

            // 2. Tải ảnh về Server Local
            if (!empty($item['photoUrl']) && empty($tour->local_photo_path)) {
                $this->info("Đang tải ảnh về server: " . $item['name']['vi']);
                try {
                    $imageContents = Http::timeout(20)->withOptions(['verify' => false])->get($item['photoUrl'])->body();
                    $extension = pathinfo(parse_url($item['photoUrl'], PHP_URL_PATH), PATHINFO_EXTENSION) ?: 'jpg';
                    $imageFilename = 'tours/' . $tour->tour_id . '_' . time() . '.' . $extension;

                    Storage::disk('public')->put($imageFilename, $imageContents);
                    $tour->update(['local_photo_path' => 'storage/' . $imageFilename]);
                } catch (\Exception $e) {
                    $this->error("Lỗi khi tải ảnh cho Tour {$tour->tour_id}: " . $e->getMessage());
                }
            }
        }

        $this->info('Đồng bộ Dữ Liệu Tour Trọn Gói và Ảnh thành công!');
    }
}
