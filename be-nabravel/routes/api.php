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

// Định tuyến để Frontend Next.js / Tools gọi vào sinh bài viết AI
Route::post('/generate-article', [ArticleGeneratorController::class, 'generate']);
// Route dạng GET dùng tạm để bạn test dễ trên trình duyệt
Route::get('/generate-article', [ArticleGeneratorController::class, 'generate']);

// --- ROUTES MỚI CHO FRONTEND NEXT.JS ---
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\HotelController;

Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{slug}', [ArticleController::class, 'show']);

Route::get('/hotels', [HotelController::class, 'index']);
Route::get('/hotels/sync', [HotelController::class, 'sync']);
Route::get('/hotels/top', [HotelController::class, 'topHotels']);
Route::get('/hotels/{slug}', [HotelController::class, 'show']);
Route::post('/hotels/sync-details', [HotelController::class, 'syncDetails']);
Route::post('/hotels/sync-price', [HotelController::class, 'syncPrice']);
