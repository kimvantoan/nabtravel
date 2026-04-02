<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\ArticleGeneratorController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GenerateArticleCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai:generate-article';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Tự động gọi AI tạo bài viết mới';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Đang khởi tạo lệnh sinh bài viết từ AI...');
        Log::info('Bắt đầu cron job tự động sinh bài viết AI.');

        try {
            $controller = new ArticleGeneratorController();
            
            // Giả lập một Request rỗng để hàm generate(Request $request) hoạt động
            $request = new Request();
            
            $response = $controller->generate($request);
            
            if ($response->getStatusCode() === 200) {
                $this->info('Sinh bài viết thành công!');
                Log::info('Sinh bài viết AI thành công: ' . $response->getContent());
            } else {
                $this->error('Lỗi khi sinh bài viết: ' . $response->getContent());
                Log::error('Lỗi sinh bài viết AI: ' . $response->getContent());
            }
        } catch (\Exception $e) {
            $this->error('Ngoại lệ: ' . $e->getMessage());
            Log::error('Có ngoại lệ khi chạy sinh bài AI tự động: ' . $e->getMessage());
        }
    }
}
