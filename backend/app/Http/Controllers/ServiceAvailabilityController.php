<?php

namespace App\Http\Controllers;

use App\Models\ServiceAvailability;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ServiceAvailabilityController extends Controller
{
    /**
     * Display a listing of service availabilities.
     */
    public function index(): JsonResponse
    {
        $services = ServiceAvailability::all();
        return response()->json([
            'success' => true,
            'data' => $services
        ], 200);
    }

    /**
     * Store a newly created service availability.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'service_name' => 'required|string|max:255',
            'route_zone' => 'required|string|max:255',
            'status' => 'required|string|max:50',
            'peak_hours' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
        ]);

        $service = ServiceAvailability::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Service availability created successfully',
            'data' => $service
        ], 201);
    }

    /**
     * Update the specified service availability.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $service = ServiceAvailability::find($id);

        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Service availability record not found.'
            ], 404);
        }

        $validated = $request->validate([
            'service_name' => 'required|string|max:255',
            'route_zone' => 'required|string|max:255',
            'status' => 'required|string|max:50',
            'peak_hours' => 'nullable|string|max:255',
            'remarks' => 'nullable|string',
        ]);

        $service->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Service availability updated successfully',
            'data' => $service
        ], 200);
    }

    /**
     * Remove the specified service availability.
     */
    public function destroy(int $id): JsonResponse
    {
        $service = ServiceAvailability::find($id);

        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Service availability record not found.'
            ], 404);
        }

        $service->delete();

        return response()->json([
            'success' => true,
            'message' => 'Service availability deleted successfully'
        ], 200);
    }
}
