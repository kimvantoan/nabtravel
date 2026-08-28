<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\ArticleGeneratorController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DestinationController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\HotelController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\TourController;
use App\Http\Controllers\TourInquiryController;
use App\Http\Controllers\Api\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ---- Authentication ----
Route::post('/auth/login', [AuthController::class, 'login']);

// ---- Public: Articles ----
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{slug}', [ArticleController::class, 'show']);

// ---- Public: Destinations ----
Route::get('/destinations', [DestinationController::class, 'index']);

// ---- Public: Hotels ----
Route::get('/hotels', [HotelController::class, 'index']);
Route::get('/hotels/top', [HotelController::class, 'topHotels']);
Route::get('/hotels/{slug}', [HotelController::class, 'show']);
Route::get('/hotels/sync', [HotelController::class, 'sync']);
Route::post('/hotels/sync-price', [HotelController::class, 'syncPrice']);
Route::post('/hotels/sync-details', [HotelController::class, 'syncDetails']);

// ---- Public: Reviews ----
Route::get('/hotels/{slug}/reviews', [ReviewController::class, 'index']);
Route::post('/hotels/{slug}/reviews', [ReviewController::class, 'store']);

// ---- Public: Tours ----
Route::get('/tours', [TourController::class, 'index']);
Route::get('/tours/{slug}', [TourController::class, 'show']);

// ---- Public: Favorites (session-based) ----
Route::get('/favorites', [FavoriteController::class, 'getFavorites']);
Route::post('/favorites/toggle', [FavoriteController::class, 'toggleFavorite']);

// ---- Public: Contact & Inquiries ----
Route::post('/contact', [ContactController::class, 'sendContactEmail']);
Route::post('/tour-inquiries', [TourInquiryController::class, 'store']);

// ---- AI Article Generator ----
Route::match(['get', 'post'], '/generate-article', [ArticleGeneratorController::class, 'generate']);
Route::match(['get', 'post'], '/generate-article/batch', [ArticleGeneratorController::class, 'batchGenerate']);
Route::get('/generate-article/quota', [ArticleGeneratorController::class, 'quota']);

// ---- Utility: Clear cache (useful for cPanel hosting without terminal) ----
Route::get('/clear-cache', function () {
    Artisan::call('optimize:clear');
    return response()->json(['message' => 'Cache cleared successfully']);
});

// ---- Admin (protected) ----
Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard/stats', function () {
        return response()->json([
            'articles'  => \App\Models\Article::where('is_ai_generated', false)->count(),
            'inquiries' => \App\Models\TourInquiry::count(),
        ]);
    });

    Route::get('/inquiries', [TourInquiryController::class, 'index']);
    Route::patch('/inquiries/{id}', [TourInquiryController::class, 'update']);
    Route::delete('/inquiries/{id}', [TourInquiryController::class, 'destroy']);

    Route::get('/articles', [ArticleController::class, 'adminIndex']);
    Route::post('/articles', [ArticleController::class, 'store']);
    Route::patch('/articles/{id}', [ArticleController::class, 'update']);
    Route::delete('/articles/{id}', [ArticleController::class, 'destroy']);
});
