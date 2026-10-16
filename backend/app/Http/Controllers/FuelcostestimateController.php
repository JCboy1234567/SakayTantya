<?php

namespace App\Http\Controllers;

use App\Models\FuelcostEstimate;
use Illuminate\Http\Request;

class FuelcostestimateController extends Controller
{
    /**
     * Display a listing of fuel cost estimates.
     */
    public function index()
    {
        return FuelcostEstimate::all();
    }

    /**
     * Store a newly created fuel cost estimate in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'fare_estimates_id' => 'required|integer|exists:fare_estimates,id',
            'fuel_prices_id' => 'required|integer|exists:fuel_prices,id',
            'price_per_liter_snapshot' => 'required|numeric|min:0',
            'fuel_efficiency_snapshot' => 'required|numeric|min:0',
            'estimated_liters' => 'required|numeric|min:0',
            'estimated_fuel_cost' => 'required|numeric|min:0',
        ]);

        $fuelcostEstimate = FuelcostEstimate::create($validated);

        return response()->json($fuelcostEstimate, 201);
    }
}