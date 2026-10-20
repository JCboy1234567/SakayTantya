<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class VehicleController extends Controller
{
    /**
     * Display a listing of vehicles.
     */
    public function index(): JsonResponse
    {
        $vehicles = Vehicle::all();
        return response()->json([
            'success' => true,
            'data' => $vehicles
        ], 200);
    }

    /**
     * Store a newly created vehicle.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vehicle_name' => 'required|string|max:255',
            'fuel_type' => 'required|string|max:50',
            'fuel_efficiency_km_per_liter' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'required|boolean',
        ]);

        $vehicle = Vehicle::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Vehicle created successfully',
            'data' => $vehicle
        ], 201);
    }

    /**
     * Update the specified vehicle.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $vehicle = Vehicle::find($id);

        if (!$vehicle) {
            return response()->json([
                'success' => false,
                'message' => 'Vehicle record not found.'
            ], 404);
        }

        $validated = $request->validate([
            'vehicle_name' => 'required|string|max:255',
            'fuel_type' => 'required|string|max:50',
            'fuel_efficiency_km_per_liter' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_active' => 'required|boolean',
        ]);

        $vehicle->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Vehicle updated successfully',
            'data' => $vehicle
        ], 200);
    }

    /**
     * Remove the specified vehicle.
     */
    public function destroy(int $id): JsonResponse
    {
        $vehicle = Vehicle::find($id);

        if (!$vehicle) {
            return response()->json([
                'success' => false,
                'message' => 'Vehicle record not found.'
            ], 404);
        }

        $vehicle->delete();

        return response()->json([
            'success' => true,
            'message' => 'Vehicle deleted successfully'
        ], 200);
    }
}
