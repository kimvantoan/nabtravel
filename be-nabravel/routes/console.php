<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Chạy lệnh tự động sinh bài viết bằng AI 1 ngày 2 lần (ví dụ lúc 8h sáng và 8h tối)
Schedule::command('ai:generate-article')->twiceDaily(8, 20);
