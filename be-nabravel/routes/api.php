<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArticleGeneratorController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Tạo bài viết AI (CHỈ POST — không cho GET để tránh crawler/trình duyệt tự trigger)
Route::post('/generate-article', [ArticleGeneratorController::class, 'generate']);
// Batch generate: tạo nhiều bài 1 lúc (tối đa 3/batch)
Route::post('/generate-article/batch', [ArticleGeneratorController::class, 'batchGenerate']);
// Kiểm tra quota còn lại hôm nay
Route::get('/generate-article/quota', [ArticleGeneratorController::class, 'quota']);

// --- ROUTES MỚI CHO FRONTEND NEXT.JS ---
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\HotelController;
use App\Http\Controllers\DestinationController;

Route::get('/destinations', [DestinationController::class, 'index']);
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{slug}', [ArticleController::class, 'show']);

use App\Http\Controllers\TourController;
Route::get('/tours', [TourController::class, 'index']);
Route::get('/tours/{slug}', [TourController::class, 'show']);

Route::get('/hotels', [HotelController::class, 'index']);
Route::get('/hotels/sync', [HotelController::class, 'sync']);
Route::get('/hotels/top', [HotelController::class, 'topHotels']);
Route::get('/hotels/{slug}', [HotelController::class, 'show']);
// Reviews Routing
Route::get('/hotels/{slug}/reviews', [App\Http\Controllers\ReviewController::class, 'index']);
Route::post('/hotels/{slug}/reviews', [App\Http\Controllers\ReviewController::class, 'store']);
Route::post('/hotels/sync-price', [HotelController::class, 'syncPrice']);
Route::post('/hotels/sync-details', [HotelController::class, 'syncDetails']);

use App\Http\Controllers\FavoriteController;
Route::get('/favorites', [FavoriteController::class, 'getFavorites']);
Route::post('/favorites/toggle', [FavoriteController::class, 'toggleFavorite']);

use App\Http\Controllers\TourInquiryController;
Route::post('/tour-inquiries', [TourInquiryController::class, 'store']);

use App\Http\Controllers\ContactController;
Route::post('/contact', [ContactController::class, 'sendContactEmail']);

use App\Http\Controllers\Api\AuthController;
Route::post('/auth/login', [AuthController::class, 'login']);

// Admin routes
Route::prefix('admin')->group(function () {
    Route::get('/dashboard/stats', function() {
        return response()->json([
            'articles' => \App\Models\Article::count(),
            'inquiries' => \App\Models\TourInquiry::count(),
        ]);
    });
    Route::get('/inquiries', [TourInquiryController::class, 'index']);
    Route::patch('/inquiries/{id}', [TourInquiryController::class, 'update']);
    Route::get('/articles', [ArticleController::class, 'adminIndex']);
    Route::post('/articles', [ArticleController::class, 'store']);
    Route::patch('/articles/{id}', [ArticleController::class, 'update']);
    Route::delete('/articles/{id}', [ArticleController::class, 'destroy']);
    Route::delete('/inquiries/{id}', [TourInquiryController::class, 'destroy']);
});
