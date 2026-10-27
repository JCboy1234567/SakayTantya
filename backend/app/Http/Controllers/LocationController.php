<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LocationController extends Controller
{
    public function index(): JsonResponse
    {
        $locations = Location::all();

        if ($locations->isEmpty()) {
            // Seed default Tagum City locations if empty
            $defaults = [
                ['name' => 'Tagum City Hall', 'category' => 'Government', 'latitude' => 7.447544, 'longitude' => 125.808389],
                ['name' => 'Tagum City Public Market', 'category' => 'Commercial', 'latitude' => 7.439123, 'longitude' => 125.811845],
                ['name' => 'Gaisano Mall of Tagum', 'category' => 'Shopping', 'latitude' => 7.445212, 'longitude' => 125.803987],
                ['name' => 'NCCC Mall Tagum', 'category' => 'Shopping', 'latitude' => 7.443154, 'longitude' => 125.809123],
                ['name' => 'Robinsons Place Tagum', 'category' => 'Shopping', 'latitude' => 7.452341, 'longitude' => 125.798124],
                ['name' => 'Tagum City National High School', 'category' => 'Education', 'latitude' => 7.450123, 'longitude' => 125.812345],
                ['name' => 'UM Tagum College', 'category' => 'Education', 'latitude' => 7.441987, 'longitude' => 125.807654],
                ['name' => 'Davao Regional Medical Center', 'category' => 'Healthcare', 'latitude' => 7.461234, 'longitude' => 125.815432],
                ['name' => 'Christ the King Cathedral', 'category' => 'Landmark', 'latitude' => 7.444567, 'longitude' => 125.805123],
                ['name' => 'New Tagum Overland Transport Terminal', 'category' => 'Transport', 'latitude' => 7.431876, 'longitude' => 125.818234],
                ['name' => 'Energy Park, Apokon', 'category' => 'Recreation', 'latitude' => 7.426123, 'longitude' => 125.825345],
                ['name' => 'Brgy. Apokon Hall', 'category' => 'Barangay', 'latitude' => 7.430123, 'longitude' => 125.820123],
                ['name' => 'Brgy. Mankilam Gymnasium', 'category' => 'Barangay', 'latitude' => 7.465123, 'longitude' => 125.795123],
                ['name' => 'Brgy. Visayan Village Market', 'category' => 'Barangay', 'latitude' => 7.449123, 'longitude' => 125.801123],
                ['name' => 'Magugpo Poblacion', 'category' => 'Barangay', 'latitude' => 7.441234, 'longitude' => 125.809654]
            ];

            foreach ($defaults as $d) {
                Location::create($d);
            }

            $locations = Location::all();
        }

        return response()->json([
            'success' => true,
            'data' => $locations
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $location = Location::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Location created successfully',
            'data' => $location
        ], 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $location = Location::find($id);
        if (!$location) {
            return response()->json(['success' => false, 'message' => 'Location not found'], 404);
        }

        $location->delete();

        return response()->json([
            'success' => true,
            'message' => 'Location deleted successfully'
        ], 200);
    }
}
