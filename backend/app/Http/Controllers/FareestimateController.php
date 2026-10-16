<?php

namespace App\Http\Controllers;

use App\Models\FareEstimate;
use Illuminate\Http\Request;

class FareestimateController extends Controller
{
    /**
     * Display a listing of fare estimates.
     */
    public function index()
    {
        return FareEstimate::all();
    }

    /**
     * Store a newly created fare estimate in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'vehicle_id' => 'required|integer|exists:vehicle,id',
            'fare_rules_id' => 'required|integer|exists:fare_rules,id',
            'pickup_name' => 'required|string|max:255',
            'pickup_latitude' => 'required|numeric|min:-90|max:90',
            'pickup_longitude' => 'required|numeric|min:-180|max:180',
            'destination_name' => 'required|string|max:255',
            'destination_latitude' => 'required|numeric|min:-90|max:90',
            'destination_longitude' => 'required|numeric|min:-180|max:180',
            'distance_km' => 'required|numeric|min:0',
            'base_fare_snapshot' => 'required|numeric|min:0',
            'distance_charge' => 'required|numeric|min:0',
            'adjustment_amount' => 'required|numeric|min:0',
            'estimated_fare' => 'required|numeric|min:0',
        ]);

        $fareEstimate = FareEstimate::create($validated);

        return response()->json($fareEstimate, 201);
    }
}
