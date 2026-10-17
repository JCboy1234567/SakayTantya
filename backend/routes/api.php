<?php

use App\Http\Controllers\FareestimateController;
use App\Http\Controllers\FareruleController;
use App\Http\Controllers\FuelcostestimateController;
use App\Http\Controllers\FuelpriceController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VehicleController;
use App\Models\FuelcostEstimate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Vehicle
Route::get('/vehicle', [VehicleController::class, 'index']);
Route::post('/vehicle', [VehicleController::class, 'store']);


// Users
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::post('/login', [UserController::class, 'login']);


// Fare_Rule
Route::get('/fare_rules', [FareruleController::class, 'index']);
Route::post('/fare_rules', [FareruleController::class, 'store']);

// Fuel_Price
Route::get('/fuel_prices', [FuelpriceController::class, 'index']);
Route::post('/fuel_prices', [FuelpriceController::class, 'store']);

// Fare_Estimates
Route::get('/fare_estimates', [FareestimateController::class, 'index']);
Route::post('/fare_estimates', [FareestimateController::class, 'store']);

// Fuel_Cost_Estimates
Route::get('/fuel_cost_estimates', [FuelcostestimateController::class, 'index']);
Route::post('/fuel_cost_estimates', [FuelcostestimateController::class, 'store']);
