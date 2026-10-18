<?php

namespace App\Http\Middleware;

  use Closure;
  use Illuminate\Http\Request;
  use Symfony\Component\HttpFoundation\Response;

  class CheckRole
  {
      /**
       * Handle an incoming request.
       *
       * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
       */
      public function handle(Request $request, Closure $next, string $role): Response
      {
          $user = $request->user();

          // I-check kung naka-login at kung tugma ang role
          if (!$user || $user->role !== $role) {
              return response()->json([
                  'message' => 'Unauthorized. Access restricted to ' . $role . 's only.'
              ], 403);
          }

          return $next($request);
      }
  }
