<?php

namespace App\Http\Controllers;

use App\Models\FuelPrice;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

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
    public function store(Request $request): JsonResponse
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

    /**
     * Update the specified fuel price in storage.
     * To preserve history, this creates a new record instead of updating the existing one.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        // We find the old record to ensure it exists, but we don't update it.
        $oldFuelPrice = FuelPrice::find($id);

        if (!$oldFuelPrice) {
            return response()->json([
                'message' => 'Fuel price record not found.'
            ], 404);
        }

        $validated = $request->validate([
            'fuel_type' => 'required|string|max:255',
            'price_per_liter' => 'required|numeric|min:0',
            'effective_date' => 'required|date',
            'source_reference' => 'nullable|string|max:255',
        ]);

        // Instead of updating, create a new historical record
        $newFuelPrice = FuelPrice::create($validated);

        return response()->json([
            'message' => 'New fuel price record created successfully to preserve history.',
            'data' => $newFuelPrice
        ], 201);
    }

    /**
     * Remove the specified fuel price from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $fuelPrice = FuelPrice::find($id);

        if (!$fuelPrice) {
            return response()->json([
                'message' => 'Fuel price record not found.'
            ], 404);
        }

        $fuelPrice->delete();

        return response()->json([
            'message' => 'Fuel price record deleted successfully.'
        ], 200);
    }
}
