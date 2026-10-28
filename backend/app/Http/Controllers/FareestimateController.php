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
     * Calculate and store a fare estimate dynamically based on vehicle, distance, and live fuel prices.
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
        $distance = (float) $validated['distance_km'];

        // Distance charge calculation
        $distanceCharge = 0.00;
        if ($distance > $includedKm) {
            $distanceCharge = ($distance - $includedKm) * $ratePerKm;
        }

        // 2. Get Fuel Price & Efficiency for precise gasoline/diesel dependent calculation
        $fuelPriceRecord = FuelPrice::where('fuel_type', 'like', '%' . $vehicle->fuel_type . '%')->latest()->first();
        $currentFuelPrice = $fuelPriceRecord ? (float) $fuelPriceRecord->price_per_liter : 60.00;
        $fuelEfficiency = (float) ($vehicle->fuel_efficiency_km_per_liter ?? 10.00);

        // Calculate estimated fuel consumed for this trip (Liters = Distance / KM per Liter)
        $estimatedLiters = $fuelEfficiency > 0 ? round($distance / $fuelEfficiency, 4) : 0.00;
        $estimatedFuelCost = round($estimatedLiters * $currentFuelPrice, 2);

        // Gasoline-dependent adjustment: Proportion of fuel cost factored into base/per-km fare
        // (e.g. baseline fuel price assumed 60.00 PHP/L)
        $baselineFuelPrice = 60.00;
        $adjustmentAmount = 0.00;
        if ($currentFuelPrice > $baselineFuelPrice && $fuelEfficiency > 0) {
            $priceDiff = $currentFuelPrice - $baselineFuelPrice;
            $adjustmentAmount = round(($priceDiff / $fuelEfficiency) * ($distance * 0.15), 2);
        }

        $estimatedFare = round($baseFare + $distanceCharge + $adjustmentAmount, 2);

        // 3. Save Fare Estimate
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

        // 4. Save Fuel Cost Estimate Record (linking fare estimate and fuel price)
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
            'message' => 'Fare calculated successfully with live gasoline/fuel pricing factors.',
            'data' => [
                'estimate' => $fareEstimate,
                'vehicle_name' => $vehicle->vehicle_name,
                'fuel_type' => $vehicle->fuel_type,
                'current_fuel_price_per_liter' => $currentFuelPrice,
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
