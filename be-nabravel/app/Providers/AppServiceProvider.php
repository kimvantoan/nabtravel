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
        // Fix SSL certificate Error locally on Windows for Mail sending & cURL
        if (file_exists(base_path('../cacert.pem'))) {
            $certPath = base_path('../cacert.pem');
            putenv('SSL_CERT_FILE=' . $certPath);
            ini_set('openssl.cafile', $certPath);
            ini_set('openssl.capath', $certPath);
            ini_set('curl.cainfo', $certPath);
        }

        // Disable SSL Verification dynamically on Symfony Mailer to prevent Email failures locally
        if (app()->environment('local')) {
            \Illuminate\Support\Facades\Event::listen(
                \Illuminate\Mail\Events\MessageSending::class,
                function (\Illuminate\Mail\Events\MessageSending $event) {
                    $transport = app('mailer')->getSymfonyTransport();
                    if ($transport instanceof \Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport) {
                        $stream = $transport->getStream();
                        if ($stream instanceof \Symfony\Component\Mailer\Transport\Smtp\Stream\SocketStream) {
                            $stream->setStreamOptions([
                                'ssl' => [
                                    'allow_self_signed' => true,
                                    'verify_peer' => false,
                                    'verify_peer_name' => false,
                                ],
                            ]);
                        }
                    }
                }
            );
        }
    }
}
