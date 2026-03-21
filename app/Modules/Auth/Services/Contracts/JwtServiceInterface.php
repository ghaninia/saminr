<?php

namespace App\Modules\Auth\Services\Contracts;

use App\Models\User;

interface JwtServiceInterface
{
    public function issueForUser(User $user): string;

    /**
     * @return array<string, mixed>
     */
    public function decode(string $token): array;

    public function cookieName(): string;

    public function ttlMinutes(): int;
}

