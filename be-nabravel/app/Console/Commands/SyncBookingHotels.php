<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SyncBookingHotels extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'hotels:sync-booking';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync booking hotels and download images to local storage';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $mapperPath = base_path('../all_hotels_booking_mapper.json');
        $detailsPath = base_path('../hotel_booking_details_full.json');

        if (!file_exists($mapperPath) || !file_exists($detailsPath)) {
            $this->error('Không tìm thấy file JSON. Vui lòng chạy Bot cào dữ liệu trước!');
            return;
        }

        $hotels = json_decode(file_get_contents($mapperPath), true);
        $detailsData = json_decode(file_get_contents($detailsPath), true);
        $detailsMap = collect($detailsData)->keyBy('booking_id')->toArray();

        // Tạo thư mục nếu chưa có
        if (!Storage::disk('public')->exists('hotels')) {
            Storage::disk('public')->makeDirectory('hotels');
        }

        $bar = $this->output->createProgressBar(count($hotels));
        $bar->start();

        foreach ($hotels as $hotel) {
            $bookingId = $hotel['booking_id'];
            $slug = $hotel['slug'];
            
            // Lấy data chi tiết (nếu có cào được)
            $detail = $detailsMap[$bookingId] ?? null;

            // 1. TẢI ẢNH ĐẠI DIỆN VỀ SERVER
            $localPhotoPath = null;
            if (!empty($hotel['photoUrl'])) {
                $filename = 'hotels/' . $slug . '.jpg';
                
                try {
                    if (!Storage::disk('public')->exists($filename)) {
                        $hdUrl = preg_replace('/square\d+|max\d+/', 'max1024x768', $hotel['photoUrl']);
                        $ctx = stream_context_create([
                            "ssl" => ["verify_peer" => false, "verify_peer_name" => false],
                            "http" => ["header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\r\n"]
                        ]);
                        $contents = @file_get_contents($hdUrl, false, $ctx);
                        if ($contents !== false) {
                            Storage::disk('public')->put($filename, $contents);
                        } else {
                            $this->error("Không thể tải ảnh cho $slug từ URL: $hdUrl");
                        }
                    }
                    // Bất kể vừa tải xong hay đã có sẵn, gắn cứng đường dẫn này vào CSDL!
                    $localPhotoPath = $filename;
                } catch (\Exception $e) {
                    $this->error("Lỗi tải ảnh cho $slug: " . $e->getMessage());
                }
            }

            // 2. CẬP NHẬT BẢNG ta_hotels
            DB::table('ta_hotels')->updateOrInsert(
                ['slug' => $slug],
                [
                    'ta_id' => $bookingId,
                    'name' => $hotel['name'],
                    'location' => $hotel['city_location'],
                    'rating' => $hotel['rating'],
                    'reviews' => $hotel['totalReviews'],
                    'price_per_night' => $hotel['price_per_night'] ?? 1500000,
                    'source_url' => $hotel['source_url'],
                    'photo_url' => $hotel['photoUrl'],
                    'local_photo_path' => $localPhotoPath,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            // 3. TẢI 10 ẢNH GALLERY VÀ CẬP NHẬT BẢNG DETAILS
            if ($detail) {
                // Fetch internal ID of ta_hotels
                $internalHotel = DB::table('ta_hotels')->where('ta_id', $bookingId)->first();
                if ($internalHotel) {
                    $localGallery = [];
                    // Tải danh sách Gallery
                    foreach ($detail['gallery'] ?? [] as $index => $imgUrl) {
                        $filenameGallery = "hotels/{$slug}_gallery_{$index}.jpg";
                        if (!Storage::disk('public')->exists($filenameGallery)) {
                            try {
                                $ctx = stream_context_create([
                                    "ssl" => ["verify_peer" => false, "verify_peer_name" => false],
                                    "http" => ["header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\r\n"]
                                ]);
                                $imgContent = @file_get_contents($imgUrl, false, $ctx);
                                if ($imgContent !== false) {
                                    Storage::disk('public')->put($filenameGallery, $imgContent);
                                }
                            } catch (\Exception $e) {}
                        }
                        $localGallery[] = $filenameGallery;
                    }

                    // Lưu vào bảng chi tiết
                    DB::table('ta_hotel_details')->updateOrInsert(
                        ['ta_id' => $bookingId],
                        [
                            'overview_text' => $detail['overview'] ?? '',
                            'amenities_json' => json_encode($detail['amenities'] ?? []),
                            'room_features_json' => json_encode($detail['room_features'] ?? []),
                            'gallery_json' => json_encode($localGallery),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                }
            }

            $bar->advance();
        }

        $bar->finish();
        $this->info("\n✅ Đã đồng bộ xong toàn bộ Khách sạn Booking vào DB và ổ cứng!");
    }
}
