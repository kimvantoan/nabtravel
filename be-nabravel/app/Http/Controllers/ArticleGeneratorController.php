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

        // 1. CHỌN CHỦ ĐỀ VÀ THỂ LOẠI (Luxury hoặc Popular)
        $theme = rand(0, 1) === 0 ? 'luxury' : 'popular';
        $limit = rand(5, 7);

        if ($theme === 'luxury') {
            $topics = [
                "Top {$limit} khách sạn sang chảnh bậc nhất mang lại trải nghiệm nghỉ dưỡng xa hoa",
                "Khám phá không gian đỉnh cao tại những resort, khách sạn thượng lưu không thể bỏ lỡ",
                "Đón đầu xu hướng nghỉ dưỡng: Những khách sạn xa xỉ nhất dành cho giới tinh hoa",
                "Trải nghiệm đế vương tại {$limit} khu lưu trú đắt đỏ và đẳng cấp nhất",
            ];
            $topic = $request->input('topic', $topics[array_rand($topics)]);
            // Lấy khách sạn có giá cao nhất
            $hotels = Hotel::where('rating', '>=', 4.0)
                ->orderBy('price', 'desc')
                ->take(20)
                ->get()
                ->shuffle()
                ->take($limit);
        } else {
            $topics = [
                "Top {$limit} khách sạn đắt khách và được đánh giá nhiều nhất hiện nay",
                "Sức hút không thể chối từ: Những khách sạn được lòng du khách nhất",
                "Giải mã sức nóng của {$limit} khách sạn nhận được 'cơn mưa' lời khen",
                "Review thực tế {$limit} khách sạn phổ biến nhất: Liệu có xứng đáng?",
            ];
            $topic = $request->input('topic', $topics[array_rand($topics)]);
            // Lấy khách sạn có nhiều lượt đánh giá nhất
            $hotels = Hotel::orderBy('reviews', 'desc')
                ->take(20)
                ->get()
                ->shuffle()
                ->take($limit);
        }

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
                        'systemInstruction' => [
                            'parts' => [
                                ['text' => 'Bạn là một nhà báo, một biên tập viên du lịch chuyên nghiệp. Bạn BẮT BUỘC phải trả về đúng định dạng text với các block ---TITLE---, ---META---, ---CONTENT--- mà không có markdown code blocks bao quanh.']
                            ]
                        ],
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
                            'responseMimeType' => 'text/plain',
                        ]
                    ]);

                if ($res->successful()) {
                    $response = $res;
                    break;
                }

                // Nếu 429 (rate limit), 404 (model không tìm thấy) hoặc 503 (quá tải) → thử model tiếp
                if ($res->status() === 429 || $res->status() === 404 || $res->status() === 503) {
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
            $hotelLines[] = "• {$h['name']} | Điểm: {$h['score']}/10 | Tiện ích: {$am} | Link: {$frontendUrl}/hotel/{$h['slug']} | Ảnh: {$h['image']}";
        }
        $hotelText = implode("\n", $hotelLines);

        return <<<PROMPT
Viết một bài báo, bài phân tích du lịch chuyên sâu chủ đề: "{$topic}"

KHÁCH SẠN (bắt buộc dùng tuần tự):
{$hotelText}

YÊU CẦU ĐỘ DÀI VÀ MỨC ĐỘ TẬP TRUNG TỪ KHÓA:
- BÀI VIẾT CẦN CỰC KỲ CHI TIẾT, ĐẠT KHOẢNG 2000 TỪ. Cần phân bổ nội dung thật sâu sắc, phong phú và dài.
- NỘI DUNG PHẢI BÁM SÁT VÀ TẬP TRUNG HOÀN TOÀN VÀO Ý NGHĨA CỦA TIÊU ĐỀ: "{$topic}". Nếu tiêu đề nhấn mạnh sự sang chảnh, hãy dùng nhiều câu từ miêu tả sự đẳng cấp, xa hoa. Nếu tiêu đề nói về lượt đánh giá cao, hãy phân tích khách quan vì sao du khách lại cực kỳ ưa chuộng.

YÊU CẦU HTML:
- Giọng văn: khách quan, chuyên nghiệp, thông tin chính xác, mang đậm phong cách báo chí và tạp chí du lịch. 
- Bố cục HTML phân chia như sau: 
  + Mở bài: 2-3 đoạn văn sâu sắc, dẫn dắt người đọc vào không gian của bài viết và trực tiếp liên kết đến tiêu đề "{$topic}".
  + Thân bài review TỪNG khách sạn (cần sử dụng các heading h2, h3 rõ ràng). VỚI MỖI KHÁCH SẠN, VIẾT KHOẢNG 300 - 400 TỪ MIÊU TẢ CỰC KỲ CHI TIẾT VÀ SỐNG ĐỘNG. Bao gồm: 
    * Cảm giác lúc đặt chân đến sảnh, không gian, mùi hương, thiết kế kiến trúc.
    * Đánh giá chi tiết nội thất phòng ngủ, view nhìn ra ngoài, tiện nghi phòng tắm.
    * Nhận xét về ẩm thực, các nhà hàng tại đây, bữa sáng buffet, hồ bơi, dịch vụ spa, thái độ nhân viên.
  + Thêm chuyên mục: "Góc nhìn chuyên gia & Đánh giá tổng quan" mang tính phân tích chuyên sâu cho người đọc ở cuối bài (khoảng 300 từ).
  + Kết bài khách quan, tổng hợp lại trọn vẹn chủ đề bài báo.
- Mỗi khách sạn phải có 1 thẻ ảnh bọc HTML đúng chuẩn như sau: <img src="(URL CỦA KHÁCH SẠN ĐÓ)" alt="(Tên khách sạn)" class="rounded-xl shadow-lg my-6 w-full object-cover aspect-video"/>
- Tên khách sạn khi nhắc đến nên bọc thẻ: <a href="(LINK CỦA KHÁCH SẠN)" class="text-[#004f32] font-bold underline">Tên Khách Sạn</a>

BẠN BẮT BUỘC PHẢI TRẢ VỀ ĐÚNG ĐỊNH DẠNG SAU (KHÔNG DÙNG JSON, KHÔNG BỌC TRONG MARKDOWN):
---TITLE---
Một tiêu đề gợi tò mò, hấp dẫn có chứa từ khóa của chủ đề
---META---
Mô tả ngắn gọn khoảng 150 ký tự
---CONTENT---
<toàn bộ HTML bài viết chi tiết, đảm bảo khoảng 2000 từ>
PROMPT;
    }

    private function parseAiResponse(string $rawText): ?array
    {
        file_put_contents(storage_path('logs/ai_raw.log'), $rawText);
        
        preg_match('/---TITLE---\s*([\s\S]*?)\s*---META---/', $rawText, $titleMatch);
        preg_match('/---META---\s*([\s\S]*?)\s*---CONTENT---/', $rawText, $metaMatch);
        preg_match('/---CONTENT---\s*([\s\S]*)$/', $rawText, $contentMatch);

        if ($titleMatch && $contentMatch) {
            return [
                'title' => trim($titleMatch[1]),
                'meta_description' => $metaMatch ? trim($metaMatch[1]) : null,
                'content' => trim($contentMatch[1])
            ];
        }
        
        return null;
    }
}
