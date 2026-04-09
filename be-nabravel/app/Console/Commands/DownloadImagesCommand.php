<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\File;
use App\Models\Hotel;
use App\Models\Destination;
use App\Models\Article;
use Illuminate\Support\Str;

class DownloadImagesCommand extends Command
{
    protected $signature = 'app:download-images';
    protected $description = 'Download external images to local Next.js public directory and update DB';

    public function handle()
    {
        // Define paths relative to the be-nabravel directory (going up to Next.js public/images)
        $nextJsPublicDir = base_path('../public/images');
        
        $headers = [
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept' => 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        ];

        /* ================= HOTELS ================= */
        $this->info("Downloading Hotel images...");
        File::ensureDirectoryExists($nextJsPublicDir . '/hotels');
        
        // Use streaming/chunking to save RAM
        Hotel::chunk(50, function ($hotels) use ($nextJsPublicDir, $headers) {
            foreach ($hotels as $hotel) {
                if ($hotel->image) {
                    $rawUrl = preg_replace('/\s+/', '', (string)$hotel->image);
                    if (filter_var($rawUrl, FILTER_VALIDATE_URL)) {
                        $pathParts = pathinfo(parse_url($rawUrl, PHP_URL_PATH));
                        $ext = isset($pathParts['extension']) ? $pathParts['extension'] : 'jpg';
                        if (strpos($ext, '?') !== false) {
                            $ext = explode('?', $ext)[0]; // strip query string
                        }
                        if (strlen($ext) > 4) $ext = 'jpg';

                        $filename = Str::slug(Str::limit($hotel->name, 40, '')) . '-' . $hotel->id . '.' . $ext;
                        $localPath = $nextJsPublicDir . '/hotels/' . $filename;
                        
                        try {
                            if (!File::exists($localPath)) {
                                $imageData = Http::withHeaders($headers)->timeout(15)->get($rawUrl)->body();
                                File::put($localPath, $imageData);
                            }
                            $hotel->image = '/images/hotels/' . $filename;
                            $hotel->save();
                            $this->line("Saved: {$hotel->image}");
                        } catch (\Exception $e) {
                            $this->error("Failed to download: {$rawUrl} - {$e->getMessage()}");
                        }
                    }
                }
            }
        });

        /* ================= DESTINATIONS ================= */
        $this->info("Downloading Destination images...");
        File::ensureDirectoryExists($nextJsPublicDir . '/destinations');
        Destination::chunk(50, function ($destinations) use ($nextJsPublicDir, $headers) {
            foreach ($destinations as $dest) {
                if ($dest->image) {
                    $rawUrl = preg_replace('/\s+/', '', (string)$dest->image);
                    if (filter_var($rawUrl, FILTER_VALIDATE_URL)) {
                        $pathParts = pathinfo(parse_url($rawUrl, PHP_URL_PATH));
                        $ext = isset($pathParts['extension']) ? $pathParts['extension'] : 'jpg';
                        if (strpos($ext, '?') !== false) $ext = explode('?', $ext)[0];
                        if (strlen($ext) > 4) $ext = 'jpg';

                        $filename = Str::slug($dest->name) . '-' . $dest->id . '.' . $ext;
                        $localPath = $nextJsPublicDir . '/destinations/' . $filename;
                        
                        try {
                            if (!File::exists($localPath)) {
                                $imageData = Http::withHeaders($headers)->timeout(15)->get($rawUrl)->body();
                                File::put($localPath, $imageData);
                            }
                            $dest->image = '/images/destinations/' . $filename;
                            $dest->save();
                            $this->line("Saved: {$dest->image}");
                        } catch (\Exception $e) {
                            $this->error("Failed: {$rawUrl}");
                        }
                    }
                }
            }
        });

        /* ================= ARTICLES ================= */
        $this->info("Downloading Article images...");
        File::ensureDirectoryExists($nextJsPublicDir . '/articles');
        Article::chunk(50, function ($articles) use ($nextJsPublicDir, $headers) {
            foreach ($articles as $article) {
                if ($article->thumbnail_url) {
                    $rawUrl = preg_replace('/\s+/', '', (string)$article->thumbnail_url);
                    if (filter_var($rawUrl, FILTER_VALIDATE_URL)) {
                        $pathParts = pathinfo(parse_url($rawUrl, PHP_URL_PATH));
                        $ext = isset($pathParts['extension']) ? $pathParts['extension'] : 'jpg';
                        if (strpos($ext, '?') !== false) $ext = explode('?', $ext)[0];
                        if (strlen($ext) > 4) $ext = 'jpg';

                        $filename = $article->slug . '-' . $article->id . '.' . $ext;
                        $localPath = $nextJsPublicDir . '/articles/' . $filename;
                        
                        try {
                            if (!File::exists($localPath)) {
                                $imageData = Http::withHeaders($headers)->timeout(15)->get($rawUrl)->body();
                                File::put($localPath, $imageData);
                            }
                            $article->thumbnail_url = '/images/articles/' . $filename;
                            $article->save();
                            $this->line("Saved: {$article->thumbnail_url}");
                        } catch (\Exception $e) {
                            $this->error("Failed: {$rawUrl}");
                        }
                    }
                }
            }
        });
        
        $this->info("Completed downloading and migrating all DB images to local Next.js instance!");
    }
}
