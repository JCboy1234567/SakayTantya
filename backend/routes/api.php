<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\VehicleController;
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