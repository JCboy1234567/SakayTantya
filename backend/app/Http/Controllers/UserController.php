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
}
