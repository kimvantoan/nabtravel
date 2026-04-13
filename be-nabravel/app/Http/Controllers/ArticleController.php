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
        // Lấy bài viết AI tự động tạo
        $articles = Article::where('is_ai_generated', true)
                           ->orderBy('created_at', 'desc')
                           ->get();

        $formattedArticles = $articles->map(function ($article) {
            // Ưu tiên dùng meta_description, nếu không có thì lấy plainText content
            $plainText = strip_tags($article->content);
            $excerpt = $article->meta_description ?: mb_substr($plainText, 0, 150) . '...';
            
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
     * Lấy danh sách bài viết do Admin tự đăng
     */
    public function adminIndex()
    {
        $articles = Article::where('is_ai_generated', false)
                           ->orderBy('created_at', 'desc')
                           ->get();

        $formattedArticles = $articles->map(function ($article) {
            $plainText = strip_tags($article->content);
            $excerpt = $article->meta_description ?: mb_substr($plainText, 0, 150) . '...';
            
            $wordCount = str_word_count(strip_tags($article->content));
            $readTime = ceil($wordCount / 200) ?: 1;

            return [
                'id' => (string) $article->id,
                'slug' => $article->slug,
                'title' => $article->title,
                'excerpt' => $excerpt,
                'meta_description' => $article->meta_description,
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
    public function show($identifier)
    {
        $article = Article::where('id', $identifier)
                          ->orWhere('slug', $identifier)
                          ->firstOrFail();

        $wordCount = str_word_count(strip_tags($article->content));
        $readTime = ceil($wordCount / 200) ?: 1;

        return response()->json([
            'id' => (string) $article->id,
            'slug' => $article->slug,
            'title' => $article->title,
            'content' => $article->content, // Nội dung raw HTML
            'meta_description' => $article->meta_description,
            'excerpt' => $article->meta_description ?: mb_substr(strip_tags($article->content), 0, 150) . '...',
            'image' => $article->thumbnail_url ?? '/images/default-hotel.jpg',
            'categoryKey' => 'travel',
            'publishedAt' => $article->created_at->toIso8601String(),
            'readTime' => $readTime,
            'is_ai_generated' => (bool)$article->is_ai_generated,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
        ]);

        $slug = \Illuminate\Support\Str::slug($request->title);
        $originalSlug = $slug;
        $counter = 1;

        while (Article::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $thumbnailUrl = $request->input('thumbnail_url');
        if ($request->hasFile('thumbnail_file')) {
            $path = $request->file('thumbnail_file')->store('images/articles', 'public');
            $thumbnailUrl = '/storage/' . $path;
        }

        $metaDescription = $request->input('meta_description');
        if (empty($metaDescription) && $request->input('content')) {
            $plainText = strip_tags(html_entity_decode($request->input('content')));
            $plainText = trim(preg_replace('/\s+/', ' ', $plainText));
            $metaDescription = mb_substr($plainText, 0, 157) . '...';
        }

        $article = Article::create([
            'title' => $request->title,
            'slug' => $slug,
            'content' => $request->input('content'),
            'meta_description' => $metaDescription,
            'thumbnail_url' => $thumbnailUrl,
            'source_url' => $request->source_url ?? '',
            'is_ai_generated' => false,
        ]);

        return response()->json($article, 201);
    }

    public function update(Request $request, $id)
    {
        $article = Article::findOrFail($id);
        $thumbnailUrl = $request->input('thumbnail_url');
        if ($request->hasFile('thumbnail_file')) {
            $path = $request->file('thumbnail_file')->store('images/articles', 'public');
            $thumbnailUrl = '/storage/' . $path;
        }

        $metaDescription = $request->input('meta_description', $article->meta_description);
        if (empty($metaDescription)) {
            $plainText = strip_tags(html_entity_decode($request->input('content') ?? $article->content));
            $plainText = trim(preg_replace('/\s+/', ' ', $plainText));
            $metaDescription = mb_substr($plainText, 0, 157) . '...';
        }

        $article->update([
            'title' => $request->title,
            'content' => $request->input('content'),
            'meta_description' => $metaDescription,
            'thumbnail_url' => $thumbnailUrl,
        ]);
        return response()->json($article);
    }

    public function destroy($id)
    {
        Article::destroy($id);
        return response()->json(['message' => 'Deleted successfully']);
    }
}
