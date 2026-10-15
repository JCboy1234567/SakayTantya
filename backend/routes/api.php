<?php

use App\Http\Controllers\FareruleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VehicleController;
use App\Models\FareRule;
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


// Fare_Rule
Route::get('/fare_rules', [FareruleController::class, 'index']);
Route::post('/fare_rules', [FareruleController::class, 'store']);