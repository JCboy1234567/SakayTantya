<?php

namespace App\Http\Controllers;

use App\Models\FuelPrice;
use Illuminate\Http\Request;

class FuelpriceController extends Controller
{
    /**
     * Display a listing of fuel prices.
     */
    public function index()
    {
        return FuelPrice::all();
    }

    /**
     * Store a newly created fuel price in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'fuel_type' => 'required|string|max:255',
            'price_per_liter' => 'required|numeric|min:0',
            'effective_date' => 'required|date',
            'source_reference' => 'nullable|string|max:255',
        ]);

        $fuelPrice = FuelPrice::create($validated);

        return response()->json($fuelPrice, 201);
    }
}
