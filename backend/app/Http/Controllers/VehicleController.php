<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            'description' => 'nullable|string',
            'is_active' => 'required',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('vehicles', 'public');
        }

        $isActive = filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN);

        $vehicle = Vehicle::create([
            'vehicle_name' => $validated['vehicle_name'],
            'fuel_type' => $validated['fuel_type'],
            'fuel_efficiency_km_per_liter' => $validated['fuel_efficiency_km_per_liter'],
            'image' => $imagePath,
            'description' => $validated['description'] ?? null,
            'is_active' => $isActive,
        ]);

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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            'description' => 'nullable|string',
            'is_active' => 'required',
        ]);

        $imagePath = $vehicle->getRawOriginal('image');
        if ($request->hasFile('image')) {
            if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }
            $imagePath = $request->file('image')->store('vehicles', 'public');
        }

        $isActive = filter_var($validated['is_active'], FILTER_VALIDATE_BOOLEAN);

        $vehicle->update([
            'vehicle_name' => $validated['vehicle_name'],
            'fuel_type' => $validated['fuel_type'],
            'fuel_efficiency_km_per_liter' => $validated['fuel_efficiency_km_per_liter'],
            'image' => $imagePath,
            'description' => $validated['description'] ?? null,
            'is_active' => $isActive,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Vehicle updated successfully',
            'data' => $vehicle
        ], 200);
    }

    /**
     * Delete the specified vehicle.
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

        $imagePath = $vehicle->getRawOriginal('image');
        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
        }

        $vehicle->delete();

        return response()->json([
            'success' => true,
            'message' => 'Vehicle deleted successfully'
        ], 200);
    }
}
