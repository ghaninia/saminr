<?php

namespace App\Modules\Auth\Services;

use App\Models\User;
use App\Modules\Auth\Services\Contracts\JwtServiceInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use RuntimeException;

class JwtService implements JwtServiceInterface
{
    public function issueForUser(User $user): string
    {
        $now = Carbon::now();

        return JWT::encode([
            'iss' => config('app.url'),
            'aud' => 'dashboard',
            'sub' => (string) $user->getKey(),
            'email' => (string) $user->email,
            'iat' => $now->timestamp,
            'exp' => $now->addMinutes($this->ttlMinutes())->timestamp,
            'jti' => (string) Str::uuid(),
        ], $this->secret(), 'HS256');
    }

    /**
     * @return array<string, mixed>
     */
    public function decode(string $token): array
    {
        $decoded = JWT::decode($token, new Key($this->secret(), 'HS256'));

        return (array) $decoded;
    }

    public function cookieName(): string
    {
        return (string) config('dashboard_jwt.cookie', 'dashboard_token');
    }

    public function ttlMinutes(): int
    {
        return max(1, (int) config('dashboard_jwt.ttl_minutes', 60 * 24 * 7));
    }

    private function secret(): string
    {
        $secret = (string) config('dashboard_jwt.secret', '');

        if ($secret !== '') {
            return $secret;
        }

        $appKey = (string) config('app.key', '');
        if ($appKey === '') {
            throw new RuntimeException('Missing APP_KEY. Set APP_KEY or DASHBOARD_JWT_SECRET.');
        }

        return hash('sha256', $appKey);
    }
}
