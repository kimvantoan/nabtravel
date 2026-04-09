<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SyncAgodaHotels extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'hotels:sync-agoda';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync scraped Agoda hotels into ta_hotels table via fuzzy matching';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $jsonPath = base_path('../all_hotels_agoda_mapper.json');

        if (!file_exists($jsonPath)) {
            $this->error("Không tìm thấy tệp JSON tại lộ trình: $jsonPath");
            return;
        }

        $jsonStr = file_get_contents($jsonPath);
        $hotels = json_decode($jsonStr, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error("Lỗi parse JSON: " . json_last_error_msg());
            return;
        }

        $allDbHotels = DB::table('ta_hotels')->get();
        $matchedCount = 0;

        $this->info("Đang khớp dữ liệu " . count($hotels) . " khách sạn Agoda...");

        foreach ($hotels as $agoda) {
            $agodaNameRaw = strtolower(trim($agoda['name']));
            
            // Tìm kiếm tốt nhất
            $bestMatch = null;
            $bestMatchScore = 0;

            foreach ($allDbHotels as $dbHotel) {
                $dbNameRaw = strtolower(trim($dbHotel->name));
                
                // Khớp tuyệt đối hoặc chuỗi con (VD: Khách sạn De La Mont Hà Giang (De La Mont Hotel Ha Giang) sẽ chứa "de la mont hotel ha giang")
                if ($agodaNameRaw === $dbNameRaw || str_contains($agodaNameRaw, $dbNameRaw) || str_contains($dbNameRaw, $agodaNameRaw)) {
                     $bestMatch = $dbHotel;
                     break;
                }
                
                // Thuật toán similar_text
                similar_text($agodaNameRaw, $dbNameRaw, $percent);
                if ($percent > $bestMatchScore && $percent > 70) {
                    $bestMatchScore = $percent;
                    $bestMatch = $dbHotel;
                }
            }

            if ($bestMatch) {
                // Update
                DB::table('ta_hotels')->where('ta_id', $bestMatch->ta_id)->update([
                    'agoda_price' => $agoda['price'] ? intval($agoda['price']) : null,
                    'agoda_url' => $agoda['agoda_url']
                ]);
                $matchedCount++;
                $this->line("✅ Đã khớp: [Agoda] {$agoda['name']} <=> [DB/Booking] {$bestMatch->name}");
            } else {
                // Thêm mới hoàn toàn (Agoda độc quyền)
                $newSlug = Str::slug($agoda['name']);
                
                // Tránh trùng slug
                $slugCount = 1;
                $originalSlug = $newSlug;
                while (DB::table('ta_hotels')->where('slug', $newSlug)->exists()) {
                    $newSlug = $originalSlug . '-' . $slugCount++;
                }

                $agodaId = "agoda_" . uniqid();

                DB::table('ta_hotels')->insert([
                    'ta_id' => $agodaId,
                    'slug' => $newSlug,
                    'name' => $agoda['name'],
                    'location' => $agoda['location'],
                    'rating' => $agoda['rating'],
                    'reviews' => $agoda['reviews'],
                    'agoda_price' => $agoda['price'] ? intval($agoda['price']) : null,
                    'agoda_url' => $agoda['agoda_url'],
                    'photo_url' => $agoda['photo_url'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                $this->info("🌟 Thêm mới (Độc quyền Agoda): {$agoda['name']}");
            }
        }

        $this->info("✨ KẾT QUẢ: Đã khớp và cập nhật Agoda URL cho $matchedCount/" . count($hotels) . " khách sạn!");
    }
}
