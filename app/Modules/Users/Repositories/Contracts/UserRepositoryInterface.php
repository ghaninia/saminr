<?php

namespace App\Modules\Users\Repositories\Contracts;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface UserRepositoryInterface
{
    public function listPaginated(?string $search = null, int $perPage = 20): LengthAwarePaginator;

    /** @param array<string, mixed> $data */
    public function create(array $data): User;

    /** @param array<string, mixed> $data */
    public function update(User $user, array $data): User;

    public function setStatus(User $user, bool $isActive): User;

    public function softDelete(User $user): void;

    public function uploadAvatar(User $user, \Illuminate\Http\UploadedFile $file): string;
}
