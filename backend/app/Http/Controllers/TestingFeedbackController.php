<?php

namespace App\Http\Controllers;

use App\Models\TestingFeedbackModel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

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
            'vehicle_plate' => 'nullable|string|max:100',
            'rating' => 'required|string|in:Excellent,Good,Needs Improvement,Bug / Issue',
            'feedback_comments' => 'required|string',
            'status' => 'nullable|string|max:50',
        ]);

        $feedback = TestingFeedbackModel::create([
            'tester_name' => $validated['tester_name'],
            'email' => $validated['email'],
            'module_tested' => $validated['module_tested'],
            'vehicle_plate' => $validated['vehicle_plate'] ?? null,
            'rating' => $validated['rating'],
            'feedback_comments' => $validated['feedback_comments'],
            'status' => $validated['status'] ?? 'Pending Review',
        ]);

        // Send email notification to admins with email_notifications enabled
        $this->sendFeedbackEmail($feedback);

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
            'vehicle_plate' => 'nullable|string|max:100',
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

    /**
     * Send email notification to admins when new feedback is submitted.
     */
    protected function sendFeedbackEmail(TestingFeedbackModel $feedback): void
    {
        try {
            // Get all admins with email_notifications enabled
            $admins = User::where('role', 'admin')
                ->where('email_notifications', true)
                ->get();

            if ($admins->isEmpty()) {
                Log::info('No admins with email notifications enabled');
                return;
            }

            foreach ($admins as $admin) {
                Mail::raw(
                    "Hello {$admin->name},\n\n" .
                    "A new testing feedback has been submitted:\n\n" .
                    "Tester: {$feedback->tester_name}\n" .
                    "Email: {$feedback->email}\n" .
                    "Module Tested: {$feedback->module_tested}\n" .
                    "Vehicle Plate: " . ($feedback->vehicle_plate ?? 'N/A') . "\n" .
                    "Rating: {$feedback->rating}\n" .
                    "Comments: {$feedback->feedback_comments}\n\n" .
                    "Please review it in the admin dashboard.\n\n" .
                    "Best regards,\nSakayTantya Team",
                    function ($message) use ($admin, $feedback) {
                        $message->to($admin->email)
                            ->subject('New Testing Feedback Submitted - SakayTantya')
                            ->replyTo($feedback->email, $feedback->tester_name);
                    }
                );

                Log::info("Feedback email sent to: {$admin->email}");
            }
        } catch (\Exception $e) {
            Log::error('Failed to send feedback email: ' . $e->getMessage());
        }
    }
}
