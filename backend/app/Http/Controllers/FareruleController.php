<?php

namespace App\Http\Controllers;

use App\Models\FareRule;
use Illuminate\Http\Request;

class FareruleController extends Controller
{
    /**
     * Display a listing of fare rules.
     */
    public function index()
    {
        return FareRule::all();
    }

    /**
     * Store a newly created fare rule in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicle,id',
            'base_fare' => 'required|numeric|min:0',
            'included_distance_km' => 'required|numeric|min:0',
            'rate_per_km' => 'required|numeric|min:0',
            'minimum_fare' => 'required|numeric|min:0',
            'valid_from' => 'required|date',
            'valid_until' => 'nullable|date|after_or_equal:valid_from',
            'source_reference' => 'nullable|string|max:255',
        ]);

        $fareRule = FareRule::create($validated);

        return response()->json($fareRule, 201);
    }
}
