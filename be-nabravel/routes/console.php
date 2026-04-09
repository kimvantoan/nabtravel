<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Chạy lệnh tự động sinh bài viết bằng AI 3 lần 1 ngày (lúc 8:30 sáng, 12h00 trưa và 4:30 chiều)
Schedule::command('ai:generate-article')->dailyAt('08:30');
Schedule::command('ai:generate-article')->dailyAt('12:00');
Schedule::command('ai:generate-article')->dailyAt('16:30');

// Tự động quét giá hàng loạt theo cụm (Phương án 2 ngày/lần) tiết kiệm Quota
// Chạy lúc 2 giờ sáng của mỗi 2 ngày (VD: Ngày 2, 4, 6, 8...)
Schedule::command('hotels:sync-prices')->cron('0 2 */2 * *');

// 1. Tự động quét danh sách Tour (tìm Tour mới) mỗi ngày vào lúc 1:00 Sáng
Schedule::command('tours:sync')->dailyAt('01:00');

// 2. Tự động cào toàn bộ thông tin chi tiết Tour (Full HD: ảnh, lịch trình, giá, v.v...)
// Vì tránh đốt băng thông và bị khóa IP, chạy 1 tháng 1 lần vào ngày đầu tháng lúc 2:00 Sáng
Schedule::command('tours:sync-details-full')->monthlyOn(1, '02:00');
