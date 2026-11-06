<?php

use App\Http\Controllers\FareestimateController;
use App\Http\Controllers\FareruleController;
use App\Http\Controllers\FuelcostestimateController;
use App\Http\Controllers\FuelpriceController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\ServiceAvailabilityController;
use App\Http\Controllers\TestingFeedbackController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VehicleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public Authentication Routes
Route::post('/login', [UserController::class, 'login']);
Route::post('/users', [UserController::class, 'store']); // Register account

// Public or General Get Routes
Route::get('/vehicle', [VehicleController::class, 'index']);
Route::get('/users', [UserController::class, 'index']);
Route::get('/fare_rules', [FareruleController::class, 'index']);
Route::get('/fuel_prices', [FuelpriceController::class, 'index']);

Route::get('/service_availability', [ServiceAvailabilityController::class, 'index']);
Route::get('/testing_feedback', [TestingFeedbackController::class, 'index']);
Route::post('/testing_feedback', [TestingFeedbackController::class, 'store']);
Route::get('/locations', [LocationController::class, 'index']);

// Test Route for Email Configuration
Route::get('/test-mail', function () {
    try {
        \Illuminate\Support\Facades\Mail::raw('This is a test email from SakayTantya to verify SMTP configuration.', function ($message) {
            $message->to('jessiegamulo1023@gmail.com')
                    ->subject('Test Email - SakayTantya');
        });
        return 'Email sent!';
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage() . '<br>Trace: ' . $e->getTraceAsString();
    }
});


// ==========================================
// PROTECTED USER ROUTES (Middleware: auth:sanctum, role:user)
// ==========================================
Route::middleware(['auth:sanctum', 'role:user'])->group(function () {
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::post('/users/{id}/delete', [UserController::class, 'destroy']);
    
    // User notification preferences
    Route::get('/users/{id}/notification-preferences', [UserController::class, 'getNotificationPreferences']);
    Route::put('/users/{id}/notification-preferences', [UserController::class, 'updateNotificationPreferences']);
});


// ==========================================
// PROTECTED ADMIN-ONLY ROUTES (Middleware: auth:sanctum, role:admin)
// ==========================================
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // User notification preferences
    Route::get('/users/{id}/notification-preferences', [UserController::class, 'getNotificationPreferences']);
    Route::put('/users/{id}/notification-preferences', [UserController::class, 'updateNotificationPreferences']);
    
    // Vehicle management
    Route::post('/vehicle', [VehicleController::class, 'store']);
    Route::put('/vehicle/{id}', [VehicleController::class, 'update']); // Multipart update with _method=PUT support
    Route::delete('/vehicle/{id}', [VehicleController::class, 'destroy']);

    // Fare Rules management
    Route::post('/fare_rules', [FareruleController::class, 'store']);
    Route::put('/fare_rules/{id}', [FareruleController::class, 'update']);
    Route::delete('/fare_rules/{id}', [FareruleController::class, 'destroy']);

    // Fuel Prices management
    Route::post('/fuel_prices', [FuelpriceController::class, 'store']);
    Route::put('/fuel_prices/{id}', [FuelpriceController::class, 'update']);
    Route::delete('/fuel_prices/{id}', [FuelpriceController::class, 'destroy']);

    // Service Availability management
    Route::post('/service_availability', [ServiceAvailabilityController::class, 'store']);
    Route::put('/service_availability/{id}', [ServiceAvailabilityController::class, 'update']);
    Route::delete('/service_availability/{id}', [ServiceAvailabilityController::class, 'destroy']);

    // Locations management
    Route::post('/locations', [LocationController::class, 'store']);
    Route::delete('/locations/{id}', [LocationController::class, 'destroy']);

    // Testing & Feedback management (Admin update/delete)
    Route::put('/testing_feedback/{id}', [TestingFeedbackController::class, 'update']);
    Route::delete('/testing_feedback/{id}', [TestingFeedbackController::class, 'destroy']);
});

// ==========================================
// SHARED AUTHENTICATED ROUTES (Middleware: auth:sanctum)
// ==========================================
Route::middleware(['auth:sanctum'])->group(function () {
    // Fare & Fuel Cost Estimates
    Route::post('/fare_estimates', [FareestimateController::class, 'store']);
    Route::post('/fuel_cost_estimates', [FuelcostestimateController::class, 'store']);
});
