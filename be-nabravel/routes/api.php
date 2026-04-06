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

Route::get('/hotels', [HotelController::class, 'index']);
Route::get('/hotels/sync', [HotelController::class, 'sync']);
Route::get('/hotels/top', [HotelController::class, 'topHotels']);
Route::get('/hotels/{slug}', [HotelController::class, 'show']);
// Reviews Routing
Route::get('/hotels/{slug}/reviews', [App\Http\Controllers\ReviewController::class, 'index']);
Route::post('/hotels/{slug}/reviews', [App\Http\Controllers\ReviewController::class, 'store']);
Route::post('/hotels/sync-price', [HotelController::class, 'syncPrice']);

use App\Http\Controllers\FavoriteController;
Route::get('/favorites', [FavoriteController::class, 'getFavorites']);
Route::post('/favorites/toggle', [FavoriteController::class, 'toggleFavorite']);
