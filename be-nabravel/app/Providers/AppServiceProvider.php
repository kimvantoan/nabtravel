<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(230);
        // Fix SSL certificate Error locally on Windows for Mail sending
        if (file_exists(base_path('../cacert.pem'))) {
            putenv('SSL_CERT_FILE=' . base_path('../cacert.pem'));
        }
    }
}
