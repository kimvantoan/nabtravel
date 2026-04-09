<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TourDetail;
use Illuminate\Support\Facades\Http;

class TranslateTourDetails extends Command
{
    protected $signature = 'tours:translate-details';
    protected $description = 'Translate JSON fields in tour_details to Vietnamese using Gemini AI.';

    public function handle()
    {
        $this->info("Bắt đầu Dịch tự động Lịch trình, Chính sách, FAQ của Tour (Ghi vào cột _vi)...");

        // Fetch details that haven't been translated (itinerary_vi_json is null but itinerary_json is not null)
        $details = TourDetail::whereNotNull('itinerary_json')
                             ->whereNull('itinerary_vi_json')
                             ->get();
        
        $total = $details->count();
        $this->info("Tìm thấy {$total} tour details cần dịch.");

        if ($total == 0) {
            $this->info("Không có dữ liệu để dịch.");
            return;
        }

        $apiKey = env('GEMINI_API_KEY');
        if (empty($apiKey) || $apiKey === 'your_gemini_api_key_here') {
            $this->error("Lỗi: Chưa cấu hình GEMINI_API_KEY trong file .env");
            return;
        }

        // Tour details are huge, so we chunk by 2 or 3 to avoid exceeding token limit.
        $chunkSize = 4; // Safest spot for Flash output limit without truncation
        $chunks = $details->chunk($chunkSize);
        $processed = 0;

        foreach ($chunks as $chunkIndex => $chunk) {
            $this->info("Đang dịch mẻ " . ($chunkIndex + 1) . "/" . $chunks->count() . "...");

            $payload = [];
            foreach ($chunk as $detail) {
                // Prepare only the English fields to be translated
                $payload[] = [
                    'id' => $detail->id,
                    'itinerary' => $detail->itinerary_json,
                    'inclusions' => $detail->inclusions_json,
                    'highlights' => $detail->highlights_json,
                    'faqs' => $detail->faqs_json,
                    'policies' => $detail->policies_json,
                    'prices' => $detail->prices_json,
                    'group_size' => $detail->group_size,
                    'meals_summary' => $detail->meals_summary,
                ];
            }

            $prompt = $this->buildPrompt($payload);
            $success = false;
            $retries = 0;

            while (!$success && $retries < 3) {
                try {
                    $res = Http::withOptions(['verify' => false])
                        ->timeout(400)
                        ->withHeaders(['Content-Type' => 'application/json'])
                        ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
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
                            $this->error("AI trả về sai cấu trúc JSON ở mẻ này. Thử lại...");
                            $retries++;
                            sleep(5);
                            $success = false;
                            continue;
                        }

                        // Update Database
                        foreach ($aiData as $row) {
                            if (isset($row['id'])) {
                                TourDetail::where('id', $row['id'])->update([
                                    'itinerary_vi_json' => $row['itinerary'] ?? null,
                                    'inclusions_vi_json' => $row['inclusions'] ?? null,
                                    'highlights_vi_json' => $row['highlights'] ?? null,
                                    'faqs_vi_json' => $row['faqs'] ?? null,
                                    'policies_vi_json' => $row['policies'] ?? null,
                                    'prices_vi_json' => $row['prices'] ?? null,
                                    'group_size_vi' => $row['group_size'] ?? null,
                                    'meals_summary_vi' => $row['meals_summary'] ?? null,
                                ]);
                            }
                        }
                        $processed += count($aiData);
                        $this->info(">> Xong mẻ " . ($chunkIndex + 1) . ". Đã dịch {$processed}/{$total} records.");

                    } else {
                        $this->error("API Lỗi: HTTP " . $res->status());
                        if ($res->status() === 429) {
                            $this->error("Bị chặn Rate Limit! Đang ngủ 20 giây trước khi thử lại...");
                            sleep(20);
                            $retries++;
                        } else {
                            $this->error($res->body());
                            break; 
                        }
                    }

                } catch (\Exception $e) {
                    $this->error("Lỗi Exception: " . $e->getMessage());
                    break;
                }
            }

            if ($chunkIndex < $chunks->count() - 1) {
                $this->info("Nghỉ 2 giây chờ mẻ tiếp theo...");
                sleep(2);
            }
        }

        $this->info("HOÀN TẤT! Đã dịch $processed records.");
    }

    private function buildPrompt(array $payload): string
    {
        $jsonPayload = json_encode($payload, JSON_UNESCAPED_UNICODE);
        return <<<PROMPT
Translate the following structural array of touring data from English exactly into Vietnamese.
Keep the exact same data structure, array bounds, and object keys, ONLY translate the string content values! 

For example, do NOT translate JSON keys. If input is:
{"id": 1, "itinerary": [{"day": 1, "title": "Arrive Hanoi", "description": "Welcome"}]}

Output MUST be:
{"id": 1, "itinerary": [{"day": 1, "title": "Đến Hà Nội", "description": "Chào mừng bạn"}]}

- Keep exact same output keys: id, itinerary, inclusions, highlights, faqs, policies, prices, group_size, meals_summary.
- Output pure JSON array.

INPUT:
{$jsonPayload}

EXPECTED OUTPUT (JSON Array):
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
