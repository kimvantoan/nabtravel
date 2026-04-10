<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ArticleGeneratorController extends Controller
{
    /**
     * Giới hạn số bài viết tạo mỗi ngày để tiết kiệm quota Gemini API.
     * Free tier: 1500 req/ngày — mỗi bài tốn ~1 request → cho phép tối đa 10 bài/ngày.
     */
    private const DAILY_LIMIT = 10;

    /**
     * Cooldown giữa 2 lần generate (giây). Tránh spam liên tục.
     */
    private const COOLDOWN_SECONDS = 60;

    /**
     * Generate a dynamic, dramatic article based on a list of hotels and a specific topic.
     */
    public function generate(Request $request)
    {
        // ── GUARD 1: Rate Limit — tối đa DAILY_LIMIT bài/ngày ──
        $dailyKey = 'article_gen_count_' . date('Y-m-d');
        $todayCount = (int) Cache::get($dailyKey, 0);

        if ($todayCount >= self::DAILY_LIMIT) {
            return response()->json([
                'error' => 'Đã đạt giới hạn ' . self::DAILY_LIMIT . ' bài viết/ngày. Thử lại vào ngày mai.',
                'daily_used' => $todayCount,
                'daily_limit' => self::DAILY_LIMIT,
            ], 429);
        }

        // ── GUARD 2: Cooldown — chờ ít nhất 60s giữa 2 lần ──
        $cooldownKey = 'article_gen_cooldown';
        if (Cache::has($cooldownKey)) {
            $remaining = Cache::get($cooldownKey) - time();
            return response()->json([
                'error' => "Vui lòng chờ {$remaining} giây trước khi tạo bài tiếp.",
                'retry_after' => $remaining,
            ], 429);
        }

        // 1. CHỌN CHỦ ĐỀ
        $topics = [
            "Khám phá top những khách sạn mang lại trải nghiệm nghỉ dưỡng tuyệt vời",
            "Gợi ý những điểm dừng chân lý tưởng cho kỳ nghỉ trọn vẹn",
            "Tận hưởng không gian thư giãn tại các khu nghỉ dưỡng đáng mơ ước",
            "Cẩm nang chọn phòng: Những góc lưu trú xinh đẹp bạn không nên bỏ lỡ",
            "Staycation trọn niềm vui: Điểm danh loạt khách sạn với dịch vụ chu đáo",
            "Lạc bước vào không gian yên bình tại những khách sạn nổi bật",
            "Review chi tiết: Những địa điểm lưu trú mang đến sự hài lòng tuyệt đối",
            "Chuyến đi thêm hoàn hảo với những gợi ý khách sạn đánh giá cao"
        ];
        $topic = $request->input('topic', $topics[array_rand($topics)]);

        // 2. LẤY DANH SÁCH HOTEL TỪ DATABASE
        $limit = rand(3, 5);
        $hotels = Hotel::inRandomOrder()->limit($limit)->get();

        if ($hotels->count() < 3) {
            return response()->json(['error' => 'Kho dữ liệu chưa đủ khách sạn. Chạy /api/hotels/sync trước.'], 400);
        }

        $hotelList = [];
        foreach ($hotels as $h) {
            $imageUrl = $h->image;
            // Tự động tải hình ảnh về server nếu là link ngoài
            if (!empty($imageUrl) && str_starts_with($imageUrl, 'http') && !str_contains($imageUrl, env('APP_URL'))) {
                try {
                    $contents = file_get_contents($imageUrl);
                    $filename = basename(parse_url($imageUrl, PHP_URL_PATH));
                    if (!$filename) $filename = uniqid() . '.jpg';
                    $localPath = 'articles/hotels/' . uniqid() . '_' . $filename;
                    \Illuminate\Support\Facades\Storage::disk('public')->put($localPath, $contents);
                    $imageUrl = env('APP_URL') . '/storage/' . $localPath;
                    
                    // Cập nhật luôn cho khách sạn để dùng lại lần sau
                    $h->update(['image' => $imageUrl]);
                } catch (\Exception $e) {
                    // Bỏ qua nếu lỗi tải ảnh
                }
            }

            $hotelList[] = [
                'name' => $h->name,
                'slug' => $h->slug,
                'location' => $h->location,
                'score' => $h->rating ?? 4.0,
                'amenities' => is_array($h->amenities) ? array_slice($h->amenities, 0, 3) : ['Bể bơi', 'Wifi miễn phí'],
                'image' => $imageUrl
            ];
        }

        // 3. XÂY DỰNG PROMPT TỐI ƯU
        $prompt = $this->buildPrompt($hotelList, $topic);

        // 4. GỌI GEMINI API (dùng model rẻ hơn + fallback)
        $apiKey = env('GEMINI_API_KEY');
        if (empty($apiKey) || $apiKey === 'your_gemini_api_key_here') {
            return response()->json(['error' => 'Thiếu GEMINI_API_KEY trong file .env'], 500);
        }

        try {
            // Thử model chính trước, fallback sang model nhẹ hơn nếu bị rate limit
            $models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro'];
            $response = null;

            foreach ($models as $model) {
                $res = Http::withOptions(['verify' => false])
                    ->timeout(90)
                    ->withHeaders(['Content-Type' => 'application/json'])
                    ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", [
                        'contents' => [
                            [
                                'role' => 'user',
                                'parts' => [
                                    ['text' => $prompt]
                                ]
                            ]
                        ],
                        'generationConfig' => [
                            'temperature' => 0.85,
                            'maxOutputTokens' => 8192,
                            'responseMimeType' => 'application/json',
                        ]
                    ]);

                if ($res->successful()) {
                    $response = $res;
                    break;
                }

                // Nếu 429 (rate limit) hoặc 404 (model không tìm thấy) → thử model tiếp
                if ($res->status() === 429 || $res->status() === 404) {
                    continue;
                }

                // Lỗi khác → dừng
                throw new \Exception("Gemini {$model}: " . $res->body());
            }

            if (!$response) {
                return response()->json([
                    'error' => 'Gemini API đang bận (rate limited). Thử lại sau vài phút.',
                ], 429);
            }

            $aiResultText = $response->json('candidates.0.content.parts.0.text');
            $aiData = $this->parseAiResponse($aiResultText);

            if (!$aiData || !isset($aiData['title']) || !isset($aiData['content'])) {
                return response()->json(['error' => 'AI trả về sai định dạng', 'raw' => $aiResultText], 500);
            }

            $thumbnailUrl = $hotelList[0]['image'];
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

            // ── Cập nhật rate limit counters ──
            Cache::put($dailyKey, $todayCount + 1, now()->endOfDay());
            Cache::put($cooldownKey, time() + self::COOLDOWN_SECONDS, self::COOLDOWN_SECONDS);

            return response()->json([
                'message' => 'Bài viết đã được tạo thành công.',
                'daily_used' => $todayCount + 1,
                'daily_limit' => self::DAILY_LIMIT,
                'data' => $article
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage(), 'line' => $e->getLine()], 500);
        }
    }

    /**
     * Xem quota hiện tại
     */
    public function quota()
    {
        $dailyKey = 'article_gen_count_' . date('Y-m-d');
        $todayCount = (int) Cache::get($dailyKey, 0);

        return response()->json([
            'daily_used' => $todayCount,
            'daily_limit' => self::DAILY_LIMIT,
            'remaining' => self::DAILY_LIMIT - $todayCount,
            'cooldown_active' => Cache::has('article_gen_cooldown'),
        ]);
    }

    /**
     * Batch generate: tạo nhiều bài 1 lúc (tối đa 3 bài/batch)
     */
    public function batchGenerate(Request $request)
    {
        $count = min((int) $request->input('count', 3), 3);
        $results = [];
        $errors = [];

        for ($i = 0; $i < $count; $i++) {
            $res = $this->generate($request);
            $data = json_decode($res->getContent(), true);

            if ($res->getStatusCode() === 200) {
                $results[] = $data['data'] ?? $data;
            } else {
                $errors[] = $data;
                // Nếu bị rate limit → dừng batch
                if ($res->getStatusCode() === 429) break;
            }

            // Chờ 2s giữa các request để tránh burst
            if ($i < $count - 1) sleep(2);
        }

        return response()->json([
            'generated' => count($results),
            'errors' => count($errors),
            'articles' => $results,
            'error_details' => $errors,
        ]);
    }

    /**
     * Dựng prompt tối ưu (ngắn gọn hơn, ít token hơn)
     */
    private function buildPrompt(array $hotels, string $topic): string
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'https://nabtravel.com'), '/');

        // Format danh sách khách sạn ngắn gọn
        $hotelLines = [];
        foreach ($hotels as $h) {
            $am = implode(', ', $h['amenities']);
            $hotelLines[] = "• {$h['name']} | Điểm: {$h['score']}/5 | Tiện ích: {$am} | Link: {$frontendUrl}/hotel/{$h['slug']} | Ảnh: {$h['image']}";
        }
        $hotelText = implode("\n", $hotelLines);

        return <<<PROMPT
Viết bài blog du lịch chuyên sâu chủ đề: "{$topic}"

KHÁCH SẠN (bắt buộc dùng):
{$hotelText}

YÊU CẦU:
- Giọng văn: nhẹ nhàng, lịch sự, truyền cảm hứng, viết dưới dạng review du lịch chuyên nghiệp của các Travel Blogger cao cấp. 
- Bố cục HTML bắt buộc định dạng như sau để kéo dài nội dung: 
  + Mở bài: 2-3 đoạn văn dài, miêu tả cảm xúc, dẫn dắt người đọc vào không gian của chủ đề.
  + Review đi sâu vào TỪNG khách sạn (cần sử dụng các heading h2, h3). VỚI MỖI KHÁCH SẠN, YÊU CẦU LƯỢNG TEXT VỪA PHẢI KHOẢNG 300-400 TỪ. 
  + Hướng dẫn phân tích từng khách sạn:
    * Miêu tả trải nghiệm không gian, từ lúc đặt chân đến sảnh, mùi hương, ánh sáng.
    * Đánh giá sâu về phong cách thiết kế kiến trúc, nội thất phòng nghỉ.
    * Review chi tiết về ẩm thực, các nhà hàng tại chỗ, bữa sáng buffet...
    * Gợi ý cụ thể các góc sống ảo đẹp thời gian chụp ảnh lý tưởng.
    * Đánh giá dịch vụ khách hàng, thái độ nhân viên và các tiện ích (spa, hồ bơi).
  + Thêm chuyên mục: "Kinh nghiệm du lịch & Tips đặt phòng" thiết thực cho người đọc ở cuối bài.
  + Kết bài ấm áp, tổng hợp lại cảm xúc.
- Mỗi khách sạn phải có 1 thẻ ảnh bọc HTML đúng chuẩn như sau: <img src='(URL CỦA KHÁCH SẠN ĐÓ)' alt='(Tên khách sạn)' class='rounded-xl shadow-lg my-6 w-full object-cover aspect-video'/>
- Tên khách sạn khi nhắc đến nên bọc thẻ: <a href='(LINK CỦA KHÁCH SẠN)' class='text-[#004f32] font-bold underline'>Tên Khách Sạn</a>
- CẤM TIỆT SỬ DỤNG DẤU NHÁY KÉP (") Ở TRONG CÁC THẺ HTML, PHẢI DÙNG DẤU NHÁY ĐƠN ('). Nhớ kỹ để JSON không bị lỗi syntax.
- ĐỘ DÀI BẮT BUỘC: Khoảng 1800 - 2200 từ. Hãy phân bổ cấu trúc hợp lý để bài viết đạt được khoảng 2000 từ. Tránh lan man lê thê.

TRẢ VỀ JSON DUY NHẤT HỢP LỆ (BẮT BUỘC PHẢI HOÀN THIỆN ĐẦY ĐỦ VÀ ĐÓNG NGOẶC HỢP LỆ):
{"title":"Tiêu đề hấp dẫn, gợi tò mò","meta_description":"Mô tả ngắn gọn khoảng 150 ký tự","content":"<toàn bộ HTML bài viết thật dài và chi tiết>"}
PROMPT;
    }

    private function parseAiResponse(string $rawText): ?array
    {
        file_put_contents(storage_path('logs/ai_raw.log'), $rawText);
        $start = strpos($rawText, '{');
        $end = strrpos($rawText, '}');
        
        if ($start !== false && $end !== false) {
            $jsonString = substr($rawText, $start, $end - $start + 1);
            return json_decode($jsonString, true);
        }
        
        return null;
    }
}
