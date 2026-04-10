<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ContactMessageMail;

class ContactController extends Controller
{
    public function sendContactEmail(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string',
            'recaptcha_token' => 'required|string',
        ]);

        $secret = env('RECAPTCHA_SECRET_KEY', '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe');
        $requestOptions = \Illuminate\Support\Facades\Http::withOptions(['verify' => true]);
        $response = $requestOptions->asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => $secret,
            'response' => $validated['recaptcha_token']
        ]);

        $recaptchaData = $response->json();

        if (!$recaptchaData['success']) {
            return response()->json([
                'success' => false,
                'message' => 'Xác thực Captcha thất bại. Vui lòng thử lại.'
            ], 422);
        }

        try {
            // Đọc email nhận từ MAIL_FROM_ADDRESS trong file .env
            $receiverEmail = config('mail.from.address');
            /** @var \Illuminate\Contracts\Mail\Mailable $mail */
            $mail = new ContactMessageMail($validated);
            Mail::to($receiverEmail)->send($mail);
            
            return response()->json([
                'success' => true,
                'message' => 'Gửi tin nhắn liên hệ thành công!'
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Mail Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi gửi mail. Vui lòng thử lại sau.'
            ], 500);
        }
    }
}
