<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Tour;
use Illuminate\Support\Facades\Http;

class TranslateTours extends Command
{
    protected $signature = 'tours:translate';
    protected $description = 'Translate name_en and description_en to Vietnamese, replacing existing data.';

    public function handle()
    {
        $this->info("Bắt đầu Dịch tự động Danh sách Tour (Ghi đè dữ liệu cũ)...");

        // Cào những tour chưa được dịch chuẩn (tức là name_vi vẫn bằng name_en do copy đè, hoặc null/rỗng)
        $tours = Tour::whereNotNull('name_en')
                     ->where(function($q) {
                         $q->whereNull('name_vi')
                           ->orWhereColumn('name_vi', 'name_en')
                           ->orWhere('name_vi', '');
                     })
                     ->get();
        
        $total = $tours->count();
        $this->info("Tìm thấy {$total} tours cần dịch.");

        if ($total == 0) {
            $this->info("Không có dữ liệu để dịch.");
            return;
        }

        $apiKey = env('GEMINI_API_KEY');
        if (empty($apiKey) || $apiKey === 'your_gemini_api_key_here') {
            $this->error("Lỗi: Chưa cấu hình GEMINI_API_KEY trong file .env");
            return;
        }

        $chunkSize = 10;
        $chunks = $tours->chunk($chunkSize);
        $processed = 0;

        foreach ($chunks as $chunkIndex => $chunk) {
            $this->info("Đang dịch mẻ " . ($chunkIndex + 1) . "/" . $chunks->count() . "...");

            $payload = [];
            foreach ($chunk as $tour) {
                $payload[] = [
                    'id' => $tour->id,
                    'name_en' => $tour->name_en,
                    'description_en' => $tour->description_en ?? ""
                ];
            }

            $prompt = $this->buildPrompt($payload);
            $success = false;
            $retries = 0;

            while (!$success && $retries < 3) {
                try {
                    $res = Http::withOptions(['verify' => false])
                        ->timeout(120)
                        ->withHeaders(['Content-Type' => 'application/json'])
                        ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key={$apiKey}", [
                            'contents' => [
                                ['role' => 'user', 'parts' => [['text' => $prompt]]]
                            ],
                            'generationConfig' => [
                                'temperature' => 0.1,
                                'responseMimeType' => 'application/json',
                            ]
                        ]);

                    if ($res->successful()) {
                        $success = true;
                        $aiResultText = $res->json('candidates.0.content.parts.0.text');
                        $aiData = $this->parseJson($aiResultText);

                        if (!$aiData || !is_array($aiData)) {
                            $this->error("AI trả về sai cấu trúc JSON ở mẻ này. Bỏ qua.");
                            break; // Thoát retry vì lỗi dữ liệu chứ ko phải rate limit
                        }

                        // Cập nhật Database
                        foreach ($aiData as $row) {
                            if (isset($row['id']) && isset($row['name_vi'])) {
                                Tour::where('id', $row['id'])->update([
                                    'name_vi' => $row['name_vi'],
                                    'description_vi' => $row['description_vi'] ?? null
                                ]);
                            }
                        }
                        $processed += count($aiData);
                        $this->info(">> Xong mẻ " . ($chunkIndex + 1) . ". Đã dịch {$processed}/{$total} tours.");

                    } else {
                        $this->error("API Lỗi: HTTP " . $res->status());
                        if ($res->status() === 429) {
                            $this->error("Bị chặn Rate Limit! Đang ngủ 60 giây trước khi thử lại...");
                            sleep(60);
                            $retries++;
                        } else {
                            break; // Lỗi khác (400, 500) thì bỏ qua
                        }
                    }

                } catch (\Exception $e) {
                    $this->error("Lỗi Exception: " . $e->getMessage());
                    break;
                }
            }

            // Anti-Rate-limit sleep (Nghỉ 15s giữa các mẻ để không bị ban API)
            if ($chunkIndex < $chunks->count() - 1) {
                $this->info("Nghỉ 10 giây chờ mẻ tiếp theo...");
                sleep(10);
            }
        }

        $this->info("HOÀN TẤT! Đã dịch $processed tours.");
    }

    private function buildPrompt(array $payload): string
    {
        $jsonPayload = json_encode($payload, JSON_UNESCAPED_UNICODE);
        return <<<PROMPT
Dịch chuẩn xác ngôn ngữ mảng JSON sau đây từ Tiếng Anh (name_en, description_en) sang Tiếng Việt.
- Tên địa danh (VD: Ha Long Bay, SAPA) vui lòng linh hoạt dịch thành tiếng Việt (Vịnh Hạ Long, Sapa).
- Giữ nguyên văn phong chuẩn du lịch.
- CHỈ TRẢ VỀ JSON DUY NHẤT.

ĐẦU VÀO:
{$jsonPayload}

ĐẦU RA MONG ĐỢI:
[
  {
    "id": <id nguyên bản>,
    "name_vi": "Tên đã dịch",
    "description_vi": "Mô tả đã dịch"
  }
]
PROMPT;
    }

    private function parseJson(string $rawText): ?array
    {
        $start = strpos($rawText, '[');
        $end = strrpos($rawText, ']');
        if ($start !== false && $end !== false) {
            $jsonString = substr($rawText, $start, $end - $start + 1);
            return json_decode($jsonString, true);
        }
        return null;
    }
}
