<?php

namespace App\Modules\Auth\Http\Middleware;

use App\Models\User;
use App\Modules\Auth\Services\Contracts\JwtServiceInterface;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Throwable;

class AdminJwtMiddleware
{
    public function __construct(private readonly JwtServiceInterface $jwt)
    {
    }

    public function handle(Request $request, Closure $next): mixed
    {
        $token = (string) $request->cookie($this->jwt->cookieName(), '');

        if ($token === '') {
            return $this->unauthorized('Authentication required.');
        }

        try {
            $payload = $this->jwt->decode($token);
        } catch (Throwable) {
            return $this->unauthorized('Invalid or expired token.');
        }

        $userId = $payload['sub'] ?? null;
        if (! is_string($userId) || $userId === '') {
            return $this->unauthorized('Invalid token payload.');
        }

        /** @var User|null $user */
        $user = User::query()->find($userId);

        if (! $user) {
            return $this->unauthorized('User not found.');
        }

        Auth::guard()->setUser($user);
        $request->setUserResolver(static fn () => $user);

        return $next($request);
    }

    private function unauthorized(string $message): JsonResponse
    {
        return response()->json([
            'message' => $message,
        ], 401);
    }
}
