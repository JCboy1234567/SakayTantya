<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
        /**
         * Display a listing of users.
         */
        public function index()
        {
            return User::all();
        }

        /**
         * Store a newly created user in storage.
         */
        public function store(Request $request)
        {
            $validated = $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('users', 'name'),
                ],
                'email' => [
                    'required',
                    'email',
                    Rule::unique('users', 'email'),
                ],
                'password' => 'required|string|min:8',
                'role' => 'nullable|string|in:admin,manager,user',
            ], [
                'name.unique' => 'This account name is already registered.',
                'email.unique' => 'This email address is already registered.',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'] ?? 'user',
            ]);

            return response()->json($user, 201);
        }

        /**
         * Update the authenticated user's profile and/or password.
         */
        public function update(Request $request, int $id)
        {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'message' => 'User not found.'
                ], 404);
            }

            $validated = $request->validate([
                'name' => [
                    'sometimes',
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('users', 'name')->ignore($id),
                ],
                'email' => [
                    'sometimes',
                    'required',
                    'email',
                    Rule::unique('users', 'email')->ignore($id),
                ],
                'current_password' => 'required_with:password|string',
                'password' => 'nullable|string|min:8',
            ], [
                'name.unique' => 'This account name is already taken.',
                'email.unique' => 'This email address is already taken.',
            ]);

            if (isset($validated['password'])) {
                if (!isset($validated['current_password']) || !Hash::check($validated['current_password'], $user->password)) {
                    return response()->json([
                        'message' => 'Current password is incorrect.'
                    ], 422);
                }
                $user->password = Hash::make($validated['password']);
            }

            if (isset($validated['name'])) {
                $user->name = $validated['name'];
            }

            if (isset($validated['email'])) {
                $user->email = $validated['email'];
            }

            $user->save();

            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role
                ]
            ], 200);
        }

        /**
         * Update user notification preferences.
         */
        public function updateNotificationPreferences(Request $request, int $id)
        {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'message' => 'User not found.'
                ], 404);
            }

            $validated = $request->validate([
                'email_notifications' => 'sometimes|boolean',
                'system_alerts' => 'sometimes|boolean',
                'feedback_alerts' => 'sometimes|boolean',
            ]);

            if (isset($validated['email_notifications'])) {
                $user->email_notifications = $validated['email_notifications'];
            }

            if (isset($validated['system_alerts'])) {
                $user->system_alerts = $validated['system_alerts'];
            }

            if (isset($validated['feedback_alerts'])) {
                $user->feedback_alerts = $validated['feedback_alerts'];
            }

            $user->save();

            return response()->json([
                'message' => 'Notification preferences updated successfully',
                'preferences' => [
                    'email_notifications' => $user->email_notifications,
                    'system_alerts' => $user->system_alerts,
                    'feedback_alerts' => $user->feedback_alerts,
                ]
            ], 200);
        }

        /**
         * Get user notification preferences.
         */
        public function getNotificationPreferences(int $id)
        {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'message' => 'User not found.'
                ], 404);
            }

            return response()->json([
                'preferences' => [
                    'email_notifications' => (bool) $user->email_notifications,
                    'system_alerts' => (bool) $user->system_alerts,
                    'feedback_alerts' => (bool) $user->feedback_alerts,
                ]
            ], 200);
        }

        /**
         * Authenticate user login.
         */
        public function login(Request $request)
        {
            $credentials = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            $user = User::where('email', $credentials['email'])->first();

            if (!$user || !Hash::check($credentials['password'], $user->password)) {
                return response()->json([
                    'message' => 'Invalid email or password.'
                ], 401);
            }

            // Generate Laravel Sanctum API Token
            $token = $user->createToken('admin-token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role
                ]
            ], 200);
        }
}
