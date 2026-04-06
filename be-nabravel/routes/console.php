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
