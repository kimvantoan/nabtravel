<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Hotel;

class MigrateAgodaHotels extends Command
{
    protected $signature = 'hotels:migrate-local';
    protected $description = 'Import local booking/agoda JSON mappers into database';

    public function handle()
    {
        $this->info("Bắt đầu đẩy dữ liệu từ JSON vào DB...");
        
        $bookingPath = base_path('../all_hotels_booking_mapper.json');
        if (file_exists($bookingPath)) {
            $hotels = json_decode(file_get_contents($bookingPath), true);
            foreach ($hotels as $h) {
                // Ignore empty rating or reviews
                if (empty($h['rating']) || empty($h['totalReviews'])) continue;

                Hotel::updateOrCreate(
                    ['slug' => ltrim($h['slug'], '/')],
                    [
                        'rapid_id' => 'BKG_' . uniqid(),
                        'name' => $h['name'],
                        'image' => $h['photoUrl'],
                        'location' => $h['city_location'] ?? 'Vietnam',
                        'rating' => $h['rating'],
                        'reviews' => (int)str_replace(',', '', $h['totalReviews']),
                        'price' => $h['price_per_night'] ?? 1500000,
                        'stars' => 5,
                        'property_type' => 'Khách sạn',
                        'price_level' => 'Đa dạng',
                        'neighborhood' => 'Khu vực trung tâm',
                        'amenities' => ['Bể bơi', 'Wifi miễn phí']
                    ]
                );
            }
            $this->info("Đã Import danh sách Booking thành công!");
        }

        $this->info("Hoàn tất đẩy dữ liệu!");
    }
}
