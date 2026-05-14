<?php

namespace App\Modules\Users\Repositories;

use App\Models\User;
use App\Modules\Users\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentUserRepository implements UserRepositoryInterface
{
    public function listPaginated(?string $search = null, int $perPage = 20): LengthAwarePaginator
    {
        $search = trim((string) $search);

        $query = User::query()->withTrashed()->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('role', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    /** @param array<string, mixed> $data */
    public function create(array $data): User
    {
        /** @var User $user */
        $user = User::query()->create($data);

        return $user;
    }

    /** @param array<string, mixed> $data */
    public function update(User $user, array $data): User
    {
        $user->fill($data)->save();

        return $user->fresh() ?? $user;
    }

    public function setStatus(User $user, bool $isActive): User
    {
        $user->is_active = $isActive;
        $user->save();

        return $user->fresh() ?? $user;
    }

    public function softDelete(User $user): void
    {
        $user->delete();
    }

    public function uploadAvatar(User $user, \Illuminate\Http\UploadedFile $file): string
    {
        $media = $user
            ->addMedia($file)
            ->toMediaCollection('avatar');

        $url = $media->getUrl();

        $user->update(['avatar' => $url]);

        return $url;
    }
}
