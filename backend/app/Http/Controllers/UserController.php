<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

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
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8',
                'role' => 'nullable|string|in:admin,manager,user',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => bcrypt($validated['password']),
                'role' => $validated['role'] ?? 'user',
            ]);

            return response()->json($user, 201);
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

            if (!$user || !\Illuminate\Support\Facades\Hash::check($credentials['password'], $user->password)) {
                return response()->json([
                    'message' => 'Invalid email or password.'
                ], 401);
            }

            // Optional: Kung gumagamit ka ng Laravel Sanctum para sa tokens
            // $token = $user->createToken('admin-token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                // 'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role
                ]
            ], 200);
        }
}
