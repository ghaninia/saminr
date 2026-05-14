<?php

namespace App\Modules\Users\Services\Contracts;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface UserServiceInterface
{
    public function listPaginated(?string $search = null, int $perPage = 20): LengthAwarePaginator;

    /** @param array<string, mixed> $data */
    public function create(array $data): User;

    /** @param array<string, mixed> $data */
    public function update(User $user, array $data): User;

    public function setStatus(User $target, bool $isActive, User $actor): User;

    public function softDelete(User $target, User $actor): void;

    public function uploadAvatar(User $target, \Illuminate\Http\UploadedFile $file): string;
}
