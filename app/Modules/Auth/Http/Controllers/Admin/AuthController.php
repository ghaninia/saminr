<?php

namespace App\Modules\Auth\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Auth\Http\Requests\Admin\ForgotPasswordRequest;
use App\Modules\Auth\Http\Requests\Admin\LoginRequest;
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

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        /** @var User|null $user */
        $user = User::query()->where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], (string) $user->password)) {
            return response()->json([
                'message' => __('responses.auth.invalid_credentials'),
            ], 422);
        }

        if (! $user->is_active || $user->role !== UserRole::ADMIN) {
            return response()->json([
                'message' => __('responses.auth.invalid_credentials'),
            ], 422);
        }

        $user->forceFill([
            'last_login_at' => now(),
        ])->save();

        $token = $this->jwt->issueForUser($user);

        return response()
            ->json([
                'message' => __('responses.auth.logged_in'),
                'user' => [
                    'id' => $user->getKey(),
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role?->value ?? null,
                    'is_active' => (bool) $user->is_active,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar,
                    'last_login_at' => $user->last_login_at,
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
                'role' => $user->role?->value ?? null,
                'is_active' => (bool) $user->is_active,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'last_login_at' => $user->last_login_at,
            ] : null,
        ]);
    }

    public function logout(): JsonResponse
    {
        return response()
            ->json(['message' => __('responses.auth.logged_out')])
            ->withCookie($this->forgetCookie());
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $payload = $request->validated();

        Password::broker()->sendResetLink(['email' => $payload['email']]);

        return response()->json([
            'message' => __('responses.auth.password_reset_sent'),
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
