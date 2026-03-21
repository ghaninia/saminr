<?php

namespace App\Modules\Auth\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Auth\Services\Contracts\JwtServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Symfony\Component\HttpFoundation\Cookie;

class AuthController extends Controller
{
    public function __construct(private readonly JwtServiceInterface $jwt)
    {
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        /** @var User|null $user */
        $user = User::query()->where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], (string) $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password.',
            ], 422);
        }

        $token = $this->jwt->issueForUser($user);

        return response()
            ->json([
                'message' => 'Logged in successfully.',
                'user' => [
                    'id' => $user->getKey(),
                    'name' => $user->name,
                    'email' => $user->email,
                ],
            ])
            ->withCookie($this->makeCookie($token));
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        return response()->json([
            'user' => $user ? [
                'id' => $user->getKey(),
                'name' => $user->name,
                'email' => $user->email,
            ] : null,
        ]);
    }

    public function logout(): JsonResponse
    {
        return response()
            ->json(['message' => 'Logged out successfully.'])
            ->withCookie($this->forgetCookie());
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'email' => ['required', 'email'],
        ]);

        Password::broker()->sendResetLink(['email' => $payload['email']]);

        return response()->json([
            'message' => 'If that email address exists, a password reset link has been sent.',
        ]);
    }

    private function makeCookie(string $token): Cookie
    {
        $minutes = $this->jwt->ttlMinutes();

        return cookie(
            $this->jwt->cookieName(),
            $token,
            $minutes,
            '/',
            null,
            (bool) config('session.secure', false),
            true,
            false,
            Cookie::SAMESITE_LAX
        );
    }

    private function forgetCookie(): Cookie
    {
        return cookie()->forget($this->jwt->cookieName(), '/', null);
    }
}
