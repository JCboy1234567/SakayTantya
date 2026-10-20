<?php

namespace App\Http\Controllers;

use App\Models\TestingFeedbackModel;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TestingFeedbackController extends Controller
{
    /**
     * Display a listing of test feedbacks.
     */
    public function index(): JsonResponse
    {
        $feedbacks = TestingFeedbackModel::latest()->get();
        return response()->json([
            'success' => true,
            'data' => $feedbacks
        ], 200);
    }

    /**
     * Store a newly created feedback.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tester_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'module_tested' => 'required|string|max:255',
            'rating' => 'required|string|in:Excellent,Good,Needs Improvement,Bug / Issue',
            'feedback_comments' => 'required|string',
            'status' => 'nullable|string|max:50',
        ]);

        $feedback = TestingFeedbackModel::create([
            'tester_name' => $validated['tester_name'],
            'email' => $validated['email'],
            'module_tested' => $validated['module_tested'],
            'rating' => $validated['rating'],
            'feedback_comments' => $validated['feedback_comments'],
            'status' => $validated['status'] ?? 'Pending Review',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Feedback submitted successfully',
            'data' => $feedback
        ], 201);
    }

    /**
     * Update the specified feedback.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $feedback = TestingFeedbackModel::find($id);

        if (!$feedback) {
            return response()->json([
                'success' => false,
                'message' => 'Feedback record not found.'
            ], 404);
        }

        $validated = $request->validate([
            'tester_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'module_tested' => 'required|string|max:255',
            'rating' => 'required|string|in:Excellent,Good,Needs Improvement,Bug / Issue',
            'feedback_comments' => 'required|string',
            'status' => 'required|string|max:50',
        ]);

        $feedback->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Feedback updated successfully',
            'data' => $feedback
        ], 200);
    }

    /**
     * Remove the specified feedback.
     */
    public function destroy(int $id): JsonResponse
    {
        $feedback = TestingFeedbackModel::find($id);

        if (!$feedback) {
            return response()->json([
                'success' => false,
                'message' => 'Feedback record not found.'
            ], 404);
        }

        $feedback->delete();

        return response()->json([
            'success' => true,
            'message' => 'Feedback deleted successfully'
        ], 200);
    }
}
