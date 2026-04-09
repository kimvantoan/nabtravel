<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use App\Models\TourDetail;
use Symfony\Component\Process\Process;

class SyncTourDetailsFull extends Command
{
    protected $signature = 'tours:sync-details-full';
    protected $description = 'Scrape full tour details, crop logo images, and sync to DB';

    public function handle()
    {
        $this->info("Bắt đầu khởi chạy Bot thu thập Tour Details mức độ sâu...");
        $this->info("Tính năng xử lý cắt Logo (Watermark) qua thư viện Sharp sẽ tự động chạy ngầm.");
        // Export tours to a JSON file for the Node scraper
        $tours = \App\Models\Tour::select('id', 'tour_id', 'source_url')->whereNotNull('source_url')->get();
        file_put_contents(base_path('../tours_to_scrape.json'), $tours->toJson());

        // Start Node scraper
        $process = Process::fromShellCommandline('node scrapper_tour_details_full.js', base_path('../'));
        $process->setTimeout(3600); // 1 hour timeout for 225 tours with image processing
        $process->run(function ($type, $buffer) {
            $this->info(trim($buffer));
        });

        if (!$process->isSuccessful()) {
            $this->error("Quá trình cào dữ liệu Node.js gặp lỗi kép.");
            return;
        }

        $jsonPath = base_path('../tour_details_full.json');
        if (!File::exists($jsonPath)) {
            $this->error("Không tìm thấy file tour_details_full.json");
            return;
        }

        $details = json_decode(File::get($jsonPath), true);
        $this->info("Tìm thấy " . count($details) . " chi tiết chuyên sâu. Đang nạp vào Database...");

        foreach ($details as $detail) {
            TourDetail::updateOrCreate(
                ['tour_id' => $detail['tour_id']],
                [
                    'group_size' => $detail['group_size'] ?? null,
                    'meals_summary' => $detail['meals_summary'] ?? null,
                    'operated_by' => $detail['operator'] ?? null,
                    'gallery_json' => isset($detail['gallery_json']) ? json_decode($detail['gallery_json'], true) : null,
                    'itinerary_json' => isset($detail['itinerary_json']) ? json_decode($detail['itinerary_json'], true) : null,
                    'inclusions_json' => isset($detail['inclusions']) ? json_decode($detail['inclusions'], true) : null,
                    'highlights_json' => isset($detail['highlights']) ? json_decode($detail['highlights'], true) : null,
                    'policies_json' => isset($detail['policies_json']) ? json_decode($detail['policies_json'], true) : null,
                    'faqs_json' => isset($detail['faqs_json']) ? json_decode($detail['faqs_json'], true) : null,
                    'prices_json' => isset($detail['prices_json']) ? json_decode($detail['prices_json'], true) : null,
                ]
            );
        }

        $this->info("Cập nhật Dữ Liệu Tour Details Full (bao gồm Logo bypass) thành công!");
    }
}
