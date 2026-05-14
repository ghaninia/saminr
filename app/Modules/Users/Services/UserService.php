<?php

namespace App\Modules\Users\Services;

use App\Models\User;
use App\Modules\Users\Repositories\Contracts\UserRepositoryInterface;
use App\Modules\Users\Services\Contracts\UserServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class UserService implements UserServiceInterface
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
    ) {}

    public function listPaginated(?string $search = null, int $perPage = 20): LengthAwarePaginator
    {
        return $this->userRepository->listPaginated($search, $perPage);
    }

    /** @param array<string, mixed> $data */
    public function create(array $data): User
    {
        return $this->userRepository->create($data);
    }

    /** @param array<string, mixed> $data */
    public function update(User $user, array $data): User
    {
        return $this->userRepository->update($user, $data);
    }

    public function setStatus(User $target, bool $isActive, User $actor): User
    {
        if ($target->id === $actor->id && ! $isActive) {
            throw ValidationException::withMessages([
                'is_active' => ['You cannot deactivate your own account.'],
            ]);
        }

        return $this->userRepository->setStatus($target, $isActive);
    }

    public function softDelete(User $target, User $actor): void
    {
        if ($target->id === $actor->id) {
            throw ValidationException::withMessages([
                'user' => ['You cannot delete your own account.'],
            ]);
        }

        $this->userRepository->softDelete($target);
    }

    public function uploadAvatar(User $target, \Illuminate\Http\UploadedFile $file): string
    {
        return $this->userRepository->uploadAvatar($target, $file);
    }
}
