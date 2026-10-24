<?php

namespace App\Http\Controllers;

use App\Models\FareRule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FareruleController extends Controller
{
    /**
     * Display a listing of fare rules with vehicle relationship.
     */
    public function index(): JsonResponse
    {
        $rules = FareRule::with('vehicle')->latest()->get();
        return response()->json([
            'success' => true,
            'data' => $rules
        ], 200);
    }

    /**
     * Store a newly created fare rule in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicle,id',
            'base_fare' => 'required|numeric|min:0',
            'included_distance_km' => 'required|numeric|min:0',
            'rate_per_km' => 'required|numeric|min:0',
            'minimum_fare' => 'required|numeric|min:0',
            'valid_from' => 'required|date',
            'valid_until' => 'nullable|date',
            'source_reference' => 'nullable|string|max:255',
        ]);

        $fareRule = FareRule::create($validated);
        $fareRule->load('vehicle');

        return response()->json([
            'success' => true,
            'message' => 'Fare rule created successfully',
            'data' => $fareRule
        ], 201);
    }

    /**
     * Update the specified fare rule in storage.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $rule = FareRule::find($id);

        if (!$rule) {
            return response()->json([
                'success' => false,
                'message' => 'Fare rule not found.'
            ], 404);
        }

        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicle,id',
            'base_fare' => 'required|numeric|min:0',
            'included_distance_km' => 'required|numeric|min:0',
            'rate_per_km' => 'required|numeric|min:0',
            'minimum_fare' => 'required|numeric|min:0',
            'valid_from' => 'required|date',
            'valid_until' => 'nullable|date',
            'source_reference' => 'nullable|string|max:255',
        ]);

        $rule->update($validated);
        $rule->load('vehicle');

        return response()->json([
            'success' => true,
            'message' => 'Fare rule updated successfully',
            'data' => $rule
        ], 200);
    }
    public function destroy(int $id): JsonResponse
    {
        $rule = FareRule::find($id);

        if (!$rule) {
            return response()->json([
                'success' => false,
                'message' => 'Fare rule not found.'
            ], 404);
        }

        $rule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fare rule deleted successfully'
        ], 200);
    }
}
