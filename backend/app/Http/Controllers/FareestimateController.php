<?php

namespace App\Http\Controllers;

use App\Models\FareEstimate;
use App\Models\FuelcostEstimate;
use App\Models\Vehicle;
use App\Models\FuelPrice;
use App\Models\FareRule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FareestimateController extends Controller
{
    /**
     * Display a listing of fare estimates.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => FareEstimate::all()
        ], 200);
    }

    /**
     * Calculate and store a fare estimate dynamically based on vehicle, distance, and weighted fuel index.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'nullable|integer|exists:users,id',
            'vehicle_id' => 'required|integer|exists:vehicle,id',
            'pickup_name' => 'required|string|max:255',
            'pickup_latitude' => 'required|numeric',
            'pickup_longitude' => 'required|numeric',
            'destination_name' => 'required|string|max:255',
            'destination_latitude' => 'required|numeric',
            'destination_longitude' => 'required|numeric',
            'distance_km' => 'required|numeric|min:0',
        ]);

        $vehicle = Vehicle::findOrFail($validated['vehicle_id']);

        // 1. Get Fare Rule
        $fareRule = FareRule::where('vehicle_id', $vehicle->id)->latest()->first();
        $baseFare = $fareRule ? (float) $fareRule->base_fare : 13.00;
        $includedKm = $fareRule ? (float) $fareRule->included_distance_km : 4.00;
        $ratePerKm = $fareRule ? (float) $fareRule->rate_per_km : 2.20;
        $minimumFare = $fareRule ? (float) ($fareRule->minimum_fare ?? $baseFare) : 13.00;
        $distance = (float) $validated['distance_km'];

        // Distance charge calculation
        $distanceCharge = 0.00;
        if ($distance > $includedKm) {
            $distanceCharge = ($distance - $includedKm) * $ratePerKm;
        }

        $standardFare = $baseFare + $distanceCharge;

        // 2. Get Fuel Price & Efficiency
        $fuelPriceRecord = FuelPrice::where('fuel_type', 'like', '%' . $vehicle->fuel_type . '%')->latest()->first();
        $currentFuelPrice = $fuelPriceRecord ? (float) $fuelPriceRecord->price_per_liter : 60.00;
        $fuelEfficiency = (float) ($vehicle->fuel_efficiency_km_per_liter ?? 10.00);

        // Calculate estimated fuel consumed for this trip (Liters = Distance / KM per Liter)
        $estimatedLiters = $fuelEfficiency > 0 ? round($distance / $fuelEfficiency, 4) : 0.00;
        $estimatedFuelCost = round($estimatedLiters * $currentFuelPrice, 2);

        // 3. Weighted Fuel-Indexed Calculation
        // F_adjusted = max(MinimumFare, StandardFare * FuelFactor)
        // FuelFactor = 1 + W_f * ((CurrentFuelPrice / BaselineFuelPrice) - 1)
        $baselineFuelPrice = 50.00; // Baseline reference price
        $fuelWeight = 0.35;         // 35% fuel component weight

        $fuelFactor = 1.0;
        $effectiveMultiplier = 1.0;
        $adjustmentAmount = 0.00;

        if ($currentFuelPrice > 0 && $baselineFuelPrice > 0) {
            $fuelFactor = $currentFuelPrice / $baselineFuelPrice;
            $effectiveMultiplier = 1.0 + $fuelWeight * ($fuelFactor - 1.0);
        }

        $rawAdjustedFare = $standardFare * $effectiveMultiplier;
        $estimatedFare = max($minimumFare, round($rawAdjustedFare, 2));
        $adjustmentAmount = round($estimatedFare - $standardFare, 2);

        // 4. Save Fare Estimate
        $fareEstimate = FareEstimate::create([
            'user_id' => $validated['user_id'] ?? ($request->user() ? $request->user()->id : 1),
            'vehicle_id' => $vehicle->id,
            'fare_rules_id' => $fareRule ? $fareRule->id : 1,
            'pickup_name' => $validated['pickup_name'],
            'pickup_latitude' => $validated['pickup_latitude'],
            'pickup_longitude' => $validated['pickup_longitude'],
            'destination_name' => $validated['destination_name'],
            'destination_latitude' => $validated['destination_latitude'],
            'destination_longitude' => $validated['destination_longitude'],
            'distance_km' => $distance,
            'base_fare_snapshot' => $baseFare,
            'distance_charge' => round($distanceCharge, 2),
            'adjustment_amount' => $adjustmentAmount,
            'estimated_fare' => $estimatedFare,
        ]);

        // 5. Save Fuel Cost Estimate Record
        if ($fuelPriceRecord) {
            FuelcostEstimate::create([
                'fare_estimates_id' => $fareEstimate->id,
                'fuel_prices_id' => $fuelPriceRecord->id,
                'price_per_liter_snapshot' => $currentFuelPrice,
                'fuel_efficiency_snapshot' => $fuelEfficiency,
                'estimated_liters' => $estimatedLiters,
                'estimated_fuel_cost' => $estimatedFuelCost,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Fare calculated successfully with weighted fuel-indexed pricing formula.',
            'data' => [
                'estimate' => $fareEstimate,
                'vehicle_name' => $vehicle->vehicle_name,
                'fuel_type' => $vehicle->fuel_type,
                'current_fuel_price_per_liter' => $currentFuelPrice,
                'baseline_fuel_price' => $baselineFuelPrice,
                'fuel_weight' => $fuelWeight,
                'effective_multiplier' => round($effectiveMultiplier, 4),
                'fuel_efficiency_km_per_liter' => $fuelEfficiency,
                'base_fare' => $baseFare,
                'distance_charge' => round($distanceCharge, 2),
                'fuel_adjustment' => $adjustmentAmount,
                'estimated_liters' => $estimatedLiters,
                'estimated_fuel_cost' => $estimatedFuelCost,
                'total_fare' => $estimatedFare
            ]
        ], 201);
    }
}
