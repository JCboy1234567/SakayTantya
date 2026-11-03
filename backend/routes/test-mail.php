<?php

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;

Route::get('/test-mail', function () {
    try {
        Mail::raw('This is a test email from SakayTantya to verify SMTP configuration.', function ($message) {
            $message->to('jessiegamulo1023@gmail.com')
                    ->subject('Test Email - SakayTantya');
        });
        return response()->json(['message' => 'Test email sent successfully!'], 200);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Failed to send email',
            'details' => $e->getMessage()
        ], 500);
    }
});
