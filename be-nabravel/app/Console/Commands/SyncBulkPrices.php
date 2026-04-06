<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Hotel;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SyncBulkPrices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'hotels:sync-prices';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync hotel prices in bulk using Booking-com18 API by scanning major destinations';

    /**
     * Tự định nghĩa một số Dest_ID phổ biến ở Việt Nam cho hệ thống Booking
     * (Đây là các Dest_ID nội bộ của hệ thống Booking.com dành cho các Tỉnh)
     */
    protected $destinations = [
        ['name' => 'Hanoi', 'dest_id' => '-3714993'],
        ['name' => 'Ho Chi Minh', 'dest_id' => '-3715805'],
        ['name' => 'Da Nang', 'dest_id' => '-3712045'],
        ['name' => 'Da Lat', 'dest_id' => '-3712125'],
        ['name' => 'Nha Trang', 'dest_id' => '-3723998'],
        ['name' => 'Vung Tau', 'dest_id' => '-3733750'],
        ['name' => 'Phu Quoc', 'dest_id' => '-3726715'],
        ['name' => 'Hoi An', 'dest_id' => '-3715975'],
        ['name' => 'Sa Pa', 'dest_id' => '-3727581'],
        ['name' => 'Ha Long', 'dest_id' => '-3714853'],
        ['name' => 'Ninh Binh', 'dest_id' => '-3711904'],
        ['name' => 'Quy Nhon', 'dest_id' => '-3727284'],
        ['name' => 'Hue', 'dest_id' => '-3716259'],
        ['name' => 'Phan Thiet', 'dest_id' => '-3725575'],
        ['name' => 'Cam Ranh', 'dest_id' => '-3711200'],
        ['name' => 'Cat Ba', 'dest_id' => '900040442'] // Some Island ID variations exist
    ];

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

        $host = 'booking-com18.p.rapidapi.com';
        
        // Quét giá cho ngày nhận phòng là thứ 6 tuần này (hoặc ngày mai)
        $checkin = date('Y-m-d', strtotime('+3 days'));
        $checkout = date('Y-m-d', strtotime('+4 days'));
        
        $this->info("Bắt đầu khởi động cỗ máy quét Giá khách sạn hàng loạt cho ngày: $checkin");
        
        // Lấy tất cả khách sạn trong DB để làm bộ đối chiếu (Dictionary)
        // Key là Tên Khách Sạn (viết thường bỏ dấu) để dễ Map
        $dbHotels = Hotel::all();
        $dbMap = [];
        foreach ($dbHotels as $h) {
            $normalizedName = Str::slug($h->name, ''); // Xóa chữ, số, dấu
            $dbMap[$normalizedName] = $h;
        }

        $bar = $this->output->createProgressBar(count($this->destinations));
        $bar->start();

        $matchCount = 0;

        foreach ($this->destinations as $dest) {
            try {
                // Mã hóa Payload locationId sang Base64 chuẩn của Booking-com18
                $locationPayload = json_encode([
                    "city_name" => $dest['name'],
                    "country" => "Vietnam",
                    "dest_id" => $dest['dest_id'],
                    "dest_type" => "city" // Cat Ba also defaults to city for search scope
                ]);
                $locationIdBase64 = base64_encode($locationPayload);

                $response = Http::withOptions(['verify' => false])->withHeaders([
                    'x-rapidapi-key' => $apiKey,
                    'x-rapidapi-host' => $host,
                ])->get("https://$host/stays/search", [
                    'locationId' => $locationIdBase64,
                    'checkinDate' => $checkin,
                    'checkoutDate' => $checkout,
                    'units' => 'metric',
                    'temperature' => 'c'
                ]);

                if ($response->successful()) {
                    $hotelsData = $response->json('data') ?? [];
                    
                    foreach ($hotelsData as $apiHotel) {
                        if (empty($apiHotel['name'])) continue;
                        
                        $apiHotelNameNormalized = Str::slug($apiHotel['name'], '');

                        // TÌM KIẾM TRONG DB: Nếu tên KS trên API khớp với KHÁCH SẠN TRONG DB (Gần đúng 90% slug)
                        // Do tên có thể bị lệch "Hotel & Spa" nên ta dò chứa nhau
                        $matchedModel = null;
                        foreach ($dbMap as $dbName => $model) {
                            if (str_contains($apiHotelNameNormalized, $dbName) || str_contains($dbName, $apiHotelNameNormalized)) {
                                $matchedModel = $model;
                                break;
                            }
                        }

                        if ($matchedModel && isset($apiHotel['priceBreakdown'])) {
                            $priceBreakdown = $apiHotel['priceBreakdown'];
                            
                            $grossPrice = $priceBreakdown['grossPrice']['value'] ?? null;
                            $strikethroughPrice = $priceBreakdown['strikethroughPrice']['value'] ?? null;
                            $badges = $priceBreakdown['benefitBadges'] ?? [];

                            if ($grossPrice) {
                                $matchedModel->price = $grossPrice;
                                
                                // Nếu có giá gốc, ta tạo một cột tạm hoặc lưu thẳng vào bảng (Gắn Json)
                                // Hiện tại bảng DB đang thiết kế cột `price` (số). Ta lưu giá Khuyến Mãi vào đây!
                                // Cập nhật cả dấu thời gian
                                $matchedModel->price_updated_at = now();
                                
                                // Thu thập nhãn dán khuyến mãi nổi bật
                                $badgeArray = [];
                                foreach ($badges as $b) {
                                    if (!empty($b['text'])) $badgeArray[] = $b['text'];
                                }
                                
                                // Nếu bạn muốn lưu Strikethrough, ta có thể lưu cấu trúc vào trường Amenities hoặc tạo 1 mảng JSON
                                // Tạm thời ghi đè giá tốt nhất vào DB (Cột Price)
                                $matchedModel->save();
                                $matchCount++;
                            }
                        }
                    }
                }
            } catch (\Exception $e) {
                // Bỏ qua lỗi Request để tiếp tục mẻ khác
            }
            
            $bar->advance();
            usleep(1000000); // Ngủ 1 giây để nhẹ API
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("🎯 Hoàn tất! Phát hiện và ráp thành công Giá Mới cho $matchCount Khách sạn trùng khớp.");
    }
}
