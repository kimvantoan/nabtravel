<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Hotel;
use App\Models\HotelDetail;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class SyncMasterHotels extends Command
{
    protected $signature = 'hotels:sync-master';
    protected $description = 'Sync bilingual matched hotel details from master_hotels_merged.json and download images to Laravel storage';

    public function handle()
    {
        $jsonPath = base_path('../master_hotels_merged.json');
        if (!File::exists($jsonPath)) {
            $this->error("File không tồn tại: $jsonPath");
            return;
        }

        $headers = [
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept' => 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            'Referer' => 'https://www.booking.com/'
        ];

        $data = json_decode(File::get($jsonPath), true);
        if (!$data || !is_array($data)) {
            $this->error("Dữ liệu JSON không hợp lệ");
            return;
        }

        $this->info("Bắt đầu đồng bộ " . count($data) . " khách sạn song ngữ...");
        $bar = $this->output->createProgressBar(count($data));
        $bar->start();

        foreach ($data as $h) {
            try {
                $slug = $h['slug'];
                // Find hotel by slug
                $hotel = Hotel::where('slug', $slug)->first();
                if (!$hotel) {
                    $hotel = new Hotel();
                    $hotel->slug = $slug;
                    $hotel->rapid_id = 'BKG_' . substr(md5($slug), 0, 10);
                }

                $hotel->name_en = $h['name']['en'] ?? $h['name']['vi'] ?? null;
                $hotel->name_vi = $h['name']['vi'] ?? null;

                $hotel->location_en = $h['location']['en'] ?? $h['location']['vi'] ?? null;
                $hotel->location_vi = $h['location']['vi'] ?? null;

                // Sync pricing
                if (isset($h['providers']['booking'])) {
                    $hotel->booking_id = $h['providers']['booking']['id'] ?? $hotel->booking_id;
                    $hotel->booking_url = $h['providers']['booking']['url'] ?? null;
                    $hotel->price = $h['providers']['booking']['price'] ?? $hotel->price;
                    $hotel->rating = $h['providers']['booking']['rating'] ?? $hotel->rating;
                    $hotel->reviews = $h['providers']['booking']['reviews'] ?? $hotel->reviews;
                }

                if (isset($h['providers']['agoda'])) {
                    $hotel->agoda_url = $h['providers']['agoda']['url'] ?? null;
                    $hotel->agoda_price = $h['providers']['agoda']['price'] ?? $hotel->agoda_price;
                }

                $hotel->save();

                // Create or Update Hotel Detail
                $detail = HotelDetail::firstOrCreate(['hotel_id' => $hotel->id]);

                // Bilingual text
                if (isset($h['overview'])) {
                    $detail->overview_en = $h['overview']['en'] ?? null;
                    $detail->overview_vi = $h['overview']['vi'] ?? null;
                }

                if (isset($h['amenities']) && is_array($h['amenities'])) {
                    $enArr = [];
                    $viArr = [];
                    foreach ($h['amenities'] as $am) {
                        if (isset($am['en'])) $enArr[] = $am['en'];
                        if (isset($am['vi'])) $viArr[] = $am['vi'];
                    }
                    $detail->amenities_en = count($enArr) > 0 ? $enArr : null;
                    $detail->amenities_vi = count($viArr) > 0 ? $viArr : null;
                }

                // Handle Gallery Downloads to Laravel Storage
                if (isset($h['gallery']) && is_array($h['gallery'])) {
                    $localPhotos = [];
                    $counter = 1;
                    foreach ($h['gallery'] as $imgUrl) {
                        if ($counter > 15) break; // Limit to 15 photos max to save space
                        
                        $rawUrl = preg_replace('/\s+/', '', (string)$imgUrl);
                        if (!filter_var($rawUrl, FILTER_VALIDATE_URL)) continue;

                        $filename = $slug . '-' . $counter . '.webp';
                        $storagePath = 'hotels/gallery/' . $filename;
                        $oldJpgPath = 'hotels/gallery/' . $slug . '-' . $counter . '.jpg';
                        $publicUrl = '/storage/hotels/gallery/' . $filename;

                        try {
                            if (!Storage::disk('public')->exists($storagePath)) {
                                $imageData = null;
                                // 1. Attempt to migrate existing JPG to WebP to save bandwidth
                                if (Storage::disk('public')->exists($oldJpgPath)) {
                                    $imageData = Storage::disk('public')->get($oldJpgPath);
                                } else {
                                    // 2. Fetch fresh from web
                                    $dynamicHeaders = $headers;
                                    if (str_contains($rawUrl, 'agoda.net') || str_contains($rawUrl, 'agoda.com')) {
                                        $dynamicHeaders['Referer'] = 'https://www.agoda.com/';
                                    }
                                    
                                    $imageData = Http::withOptions(['verify' => false])
                                        ->withHeaders($dynamicHeaders)
                                        ->timeout(15)
                                        ->get($rawUrl)
                                        ->body();
                                }
                                
                                if ($imageData) {
                                    $im = @imagecreatefromstring($imageData);
                                    if ($im !== false) {
                                        ob_start();
                                        imagewebp($im, null, 70); // Compress to 70% quality WebP
                                        $compressedData = ob_get_clean();
                                        imagedestroy($im);
                                        Storage::disk('public')->put($storagePath, $compressedData);
                                        // Cleanup old large JPG
                                        if (Storage::disk('public')->exists($oldJpgPath)) {
                                            Storage::disk('public')->delete($oldJpgPath);
                                        }
                                    } else {
                                        Storage::disk('public')->put($storagePath, $imageData);
                                    }
                                }
                            }
                            $localPhotos[] = $publicUrl;
                        } catch (\Exception $e) {
                            // Cố tình rớt ảnh (Drop image) thay vì lưu Link gốc hỏng
                            continue;
                        }
                        $counter++;
                    }
                    
                    if (count($localPhotos) > 0) {
                        $detail->photos = $localPhotos;
                        // Always override the external image with local storage path or fallback
                        $hotel->image = $localPhotos[0];
                        $hotel->save();
                    }
                }

                $detail->save();
            } catch (\Exception $e) {
                $this->error("Lỗi insert ".$slug. ": " . $e->getMessage());
            }
            $bar->advance();
        }

        $bar->finish();
        // Cập nhật task artifact báo trạng thái
        $this->newLine();
        $this->info("Đồng bộ hoàn tất!");
    }
}
