<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ArticleController extends Controller
{
    /**
     * Lấy danh sách bài viết định dạng chuẩn cho Next.js
     */
    public function index()
    {
        // Lấy tất cả bài viết mới nhất (có thể thêm phân trang sau này)
        $articles = Article::orderBy('created_at', 'desc')->get();

        $formattedArticles = $articles->map(function ($article) {
            // Loại bỏ thẻ HTML khỏi nội dung để làm excerpt ngang ngửa UI
            $plainText = strip_tags($article->content);
            $excerpt = mb_substr($plainText, 0, 150) . '...';
            
            // Ước tính số phút đọc (tốc độ trung bình 200 từ/phút)
            $wordCount = str_word_count(strip_tags($article->content));
            $readTime = ceil($wordCount / 200) ?: 1;

            return [
                'id' => (string) $article->id,
                'slug' => $article->slug,
                'title' => $article->title,
                'excerpt' => $excerpt,
                'image' => $article->thumbnail_url ?? '/images/default-hotel.jpg',
                'categoryKey' => 'travel',
                'publishedAt' => $article->created_at->toIso8601String(),
                'readTime' => $readTime,
            ];
        });

        return response()->json($formattedArticles);
    }

    /**
     * Xem chi tiết một bài viết
     */
    public function show($slug)
    {
        $article = Article::where('slug', $slug)->firstOrFail();

        $wordCount = str_word_count(strip_tags($article->content));
        $readTime = ceil($wordCount / 200) ?: 1;

        return response()->json([
            'id' => (string) $article->id,
            'slug' => $article->slug,
            'title' => $article->title,
            'content' => $article->content, // Nội dung raw HTML
            'image' => $article->thumbnail_url ?? '/images/default-hotel.jpg',
            'categoryKey' => 'travel',
            'publishedAt' => $article->created_at->toIso8601String(),
            'readTime' => $readTime,
        ]);
    }
}
