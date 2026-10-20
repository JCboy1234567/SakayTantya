<?php

use App\Http\Controllers\FareestimateController;
use App\Http\Controllers\FareruleController;
use App\Http\Controllers\FuelcostestimateController;
use App\Http\Controllers\FuelpriceController;
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

// Public or General Get Routes (Kung kailangan makita ng users/admin ang lists)
Route::get('/vehicle', [VehicleController::class, 'index']);
Route::get('/users', [UserController::class, 'index']);
Route::get('/fare_rules', [FareruleController::class, 'index']);
Route::get('/fuel_prices', [FuelpriceController::class, 'index']);
Route::get('/fare_estimates', [FareestimateController::class, 'index']);
Route::get('/fuel_cost_estimates', [FuelcostestimateController::class, 'index']);
Route::get('/service_availability', [ServiceAvailabilityController::class, 'index']);
Route::get('/testing_feedback', [TestingFeedbackController::class, 'index']);
Route::post('/testing_feedback', [TestingFeedbackController::class, 'store']); // Allow public/testers to submit feedback


// ==========================================
// PROTECTED ADMIN-ONLY ROUTES (Middleware: role:admin)
// ==========================================
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Vehicle management
    Route::post('/vehicle', [VehicleController::class, 'store']);
    Route::put('/vehicle/{id}', [VehicleController::class, 'update']);
    Route::delete('/vehicle/{id}', [VehicleController::class, 'destroy']);

    // Fare Rules management
    Route::post('/fare_rules', [FareruleController::class, 'store']);

    // Fuel Prices management
    Route::post('/fuel_prices', [FuelpriceController::class, 'store']);
    Route::put('/fuel_prices/{id}', [FuelpriceController::class, 'update']);
    Route::delete('/fuel_prices/{id}', [FuelpriceController::class, 'destroy']);

    // Service Availability management
    Route::post('/service_availability', [ServiceAvailabilityController::class, 'store']);
    Route::put('/service_availability/{id}', [ServiceAvailabilityController::class, 'update']);
    Route::delete('/service_availability/{id}', [ServiceAvailabilityController::class, 'destroy']);

    // Testing & Feedback management (Admin update/delete)
    Route::put('/testing_feedback/{id}', [TestingFeedbackController::class, 'update']);
    Route::delete('/testing_feedback/{id}', [TestingFeedbackController::class, 'destroy']);

    // Fare & Fuel Cost Estimates (kung admin lang ang pwede mag-save)
    Route::post('/fare_estimates', [FareestimateController::class, 'store']);
    Route::post('/fuel_cost_estimates', [FuelcostestimateController::class, 'store']);
});
