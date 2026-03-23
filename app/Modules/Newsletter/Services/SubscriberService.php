<?php

namespace App\Modules\Newsletter\Services;

use App\Modules\Newsletter\Models\Subscriber;
use App\Modules\Newsletter\Services\Contracts\SubscriberServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SubscriberService implements SubscriberServiceInterface
{
    public function subscribe(string $fullname, string $email): Subscriber
    {
        return Subscriber::query()->updateOrCreate(
            ['email' => $email],
            ['fullname' => $fullname]
        );
    }

    public function listPaginated(?string $search = null, int $perPage = 50): LengthAwarePaginator
    {
        $search = trim((string) $search);

        $query = Subscriber::query()->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('fullname', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    public function delete(Subscriber $subscriber): void
    {
        $subscriber->delete();
    }
}

