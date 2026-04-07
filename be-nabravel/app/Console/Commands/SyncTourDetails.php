<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TourDetail;

class SyncTourDetails extends Command
{
    protected $signature = 'tours:sync-details';
    protected $description = 'Sync crawled tour details into the tour_details table';

    public function handle()
    {
        $this->info("Bắt đầu đồng bộ Tour Details...");

        $jsonPath = base_path('../tour_details_crawled.json');
        if (!file_exists($jsonPath)) {
            $this->error("Không tìm thấy file {$jsonPath}. Vui lòng chạy scrapper_tour_details.js trước.");
            return;
        }

        $jsonContent = file_get_contents($jsonPath);
        $detailsData = json_decode($jsonContent, true);

        if (!$detailsData) {
            $this->error("Lỗi parse JSON.");
            return;
        }

        $this->info("Tìm thấy " . count($detailsData) . " chi tiết. Đang nạp vào Database...");

        foreach ($detailsData as $item) {
            TourDetail::updateOrCreate(
                ['tour_id' => $item['tour_id']],
                [
                    'itinerary_json' => $item['itinerary_json'] ?? null,
                    'highlights_json' => $item['highlights_json'] ?? null,
                    'inclusions_json' => $item['inclusions_json'] ?? null,
                    'exclusions_json' => $item['exclusions_json'] ?? null,
                ]
            );
        }

        $this->info('Đồng bộ Dữ Liệu Tour Details thành công!');
    }
}
