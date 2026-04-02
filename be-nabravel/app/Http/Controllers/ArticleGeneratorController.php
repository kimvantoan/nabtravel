<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ArticleGeneratorController extends Controller
{
    /**
     * Generate a dynamic, dramatic article based on a list of hotels and a specific topic.
     */
    public function generate(Request $request)
    {
        // 1. CHỌN CHỦ ĐỀ CHUYÊN MÔN VÀ ĐA DẠNG NGẪU NHIÊN
        $topics = [
            "Top 5 khách sạn sang chảnh nhất đáng để tiêu tiền",
            "Sự thật mất lòng về top các khu nghỉ dưỡng hot nhất",
            "Đại hạ giá bất ngờ: Những khách sạn giảm sâu nhất tháng này",
            "Nên ở đâu để sống ảo tung chảo? Bóc giá các khách sạn",
            "Top 5 hotel tệ nhất làm hỏng kỳ nghỉ của bạn",
            "Cuối tuần trốn việc: Resort ngoại ô đáng giá từng xu",
            "Staycation tại thành phố: Bất ngờ với view triệu đô",
            "Khách sạn Mường Thanh giảm giá sâu cho khách du lịch hết tháng này",
            "Đừng đặt phòng trước khi đọc bài vạch trần chất lượng các khách sạn này",
            "Review chân thực nhất: Sự thật ngã ngửa đằng sau ảnh mạng khách sạn"
        ];
        $topic = $request->input('topic', $topics[array_rand($topics)]);

        // 2. LẤY DANH SÁCH HOTEL TỪ DATABASE LOCAL (Thay vì gọi RapidAPI)
        // Hệ thống sẽ bốc ngẫu nhiên 3~5 khách sạn có sẵn trong database để AI chế biến
        $limit = rand(3, 5);
        $hotels = Hotel::inRandomOrder()->limit($limit)->get();

        if ($hotels->count() < 3) {
            return response()->json(['error' => 'Kho dữ liệu chưa đủ khách sạn. Vui lòng chạy API /api/hotels/sync trước.'], 400);
        }

        $hotelList = [];
        foreach ($hotels as $h) {
            $hotelList[] = [
                'name' => $h->name,
                'slug' => $h->slug,
                'location' => $h->location,
                'score' => $h->rating ?? 4.0,
                'amenities' => is_array($h->amenities) ? array_slice($h->amenities, 0, 3) : ['Bể bơi', 'Wifi miễn phí'],
                'image' => $h->image
            ];
        }

        // 3. XÂY DỰNG PROMPT CỰC KỲ CHI TIẾT CHO AI
        $prompt = $this->buildPrompt($hotelList, $topic);

        // 4. GỌI GEMINI API
        $apiKey = env('GEMINI_API_KEY');
        if (empty($apiKey) || $apiKey === 'your_gemini_api_key_here') {
            return response()->json(['error' => 'Thiếu GEMINI_API_KEY trong file .env'], 500);
        }

        try {
            $response = Http::withOptions(['verify' => false])
                ->timeout(60) // AI cần thời gian
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                    'contents' => [
                        [
                            'role' => 'user',
                            'parts' => [
                                ['text' => $prompt]
                            ]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature' => 0.85, // Tăng thêm tính sáng tạo và drama
                    ]
                ]);

            if ($response->failed()) {
                throw new \Exception('Lỗi khi gọi Gemini API: ' . $response->body());
            }

            $aiResultText = $response->json('candidates.0.content.parts.0.text');
            
            // Parse kết quả trả về
            $aiData = $this->parseAiResponse($aiResultText);

            if (!$aiData || !isset($aiData['title']) || !isset($aiData['content'])) {
                return response()->json(['error' => 'AI trả về sai định dạng', 'raw' => $aiResultText], 500);
            }

            // Tự động chèn thumbnail cho bài viết: Lấy image của khách sạn đầu tiên được đề cập
            $thumbnailUrl = $hotelList[0]['image'];

            // Lấy danh sách slug để gán vào hotel_ids
            $hotelSlugs = array_column($hotelList, 'slug');

            // 5. LƯU BÀI VIẾT VÀO DATABASE
            $article = Article::create([
                'title' => $aiData['title'],
                'slug' => Str::slug($aiData['title']) . '-' . rand(1000, 9999), 
                'content' => $aiData['content'],
                'meta_description' => $aiData['meta_description'] ?? null,
                'thumbnail_url' => $thumbnailUrl,
                'hotel_ids' => $hotelSlugs,
                'status' => 'draft',
            ]);

            return response()->json([
                'message' => 'Bài viết đa dạng/drama đã được tạo thành công.',
                'data' => $article
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage(), 'line' => $e->getLine()], 500);
        }
    }

    /**
     * Dựng chuỗi kịch bản mồi (Prompt) chi tiết
     */
    private function buildPrompt(array $hotels, string $topic): string
    {
        // Lấy domain Frontend từ .env (phòng trường hợp đổi tên miền)
        $frontendUrl = env('FRONTEND_URL', 'https://nabtravel.vn');
        $frontendUrl = rtrim($frontendUrl, '/'); // Xóa dấu '/' thừa ở cuối nếu có

        // Convert danh sách khách sạn thành chuỗi text dễ hiểu cho AI
        $hotelDetails = "";
        foreach ($hotels as $h) {
            $amstr = implode(', ', $h['amenities']);
            $hotelDetails .= "- Khách sạn: **{$h['name']}**\n";
            $hotelDetails .= "  + Điểm: {$h['score']}/10\n";
            $hotelDetails .= "  + Tiện ích: {$amstr}\n";
            $hotelDetails .= "  + Link gắn: {$frontendUrl}/hotel/{$h['slug']}\n";
            $hotelDetails .= "  + URL Ảnh thật: {$h['image']}\n\n";
        }

        return <<<PROMPT
BẠN LÀ MỘT BLOGGER DU LỊCH ĐÌNH ĐÁM, CHUYÊN ĐƯA RA CÁC ĐÁNH GIÁ THỰC TẾ, GẮT GAO VÀ CÓ CHÚT "DRAMA", GÂY TÒ MÒ ĐỂ KÉO VIEW.
Chủ đề bài viết hôm nay của bạn là: "{$topic}".

Dưới đây là danh sách các khách sạn bạn bắt buộc phải dùng để phác họa nội dung bài viết:
{$hotelDetails}

YÊU CẦU TUYỆT ĐỐI VỀ NỘI DUNG (VIẾT BẰNG HTML):
1. **Thái độ viết bài:** Thật kịch tính, lôi cuốn, đưa ra các nhận định gây sốc nhưng đánh giá khách quan hợp lý (Top đáng đến thì tung hô, Top tệ thì chê thật sự có nghệ thuật, Giảm giá thì hô hào).
2. **Bố cục bài viết:** Phải có mở bài lôi cuốn, các phần phân tích từng khách sạn rõ ràng (dùng h2, h3), và kết bài.
3. **Chèn ảnh tự động:** Ở trong mỗi phần phân tích về 1 khách sạn cụ thể, BẠN BẮT BUỘC phải chèn một thẻ <img> chứa đúng "URL Ảnh thật" mà tôi đã cung cấp kèm caption. TRUYỆT ĐỐI KHÔNG đường dùng URL ảnh khác ngoài URL tôi cấp. Ví dụ: <img src="..." alt="..." class="rounded-xl shadow-lg my-6 w-full object-cover aspect-video" />
4. **Gắn Link Điều Hướng:** Trong phần review của khách sạn đó, nhắc tên khách sạn phải bọc bằng thẻ <a> trỏ đúng tới "Link gắn" tôi cung cấp ở phía trên trang thông tin, để người đọc Click vào là bay ra trang chi tiết ngay. Bọc theo một class CSS đẹp mắt như <a href="..." class="text-[#004f32] font-bold underline">Tên</a>

TRẢ VỀ DUY NHẤT 1 KHỐI JSON ĐÚNG QUY CHUẨN ĐỂ PARSE (KHÔNG IN RA GÌ THÊM):
{
  "title": "TIÊU ĐỀ GIẬT TÍT, CHUẨN CLICKBAIT NHƯNG KHÔNG LỪA ĐẢO",
  "meta_description": "Mô tả ngắn kích thích tò mò (150 ký tự)",
  "content": "<toàn_bộ_html_bài_viết_như_bạn_đã_được_yêu_cầu_viết>"
}
PROMPT;
    }

    /**
     * Parse chuỗi JSON do AI trả về
     */
    private function parseAiResponse(string $rawText): ?array
    {
        $cleaned = preg_replace('/^```json\s*/i', '', $rawText);
        $cleaned = preg_replace('/```$/i', '', $cleaned);
        return json_decode(trim($cleaned), true);
    }
}
