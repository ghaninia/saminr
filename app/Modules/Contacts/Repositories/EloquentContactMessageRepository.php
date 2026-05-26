<?php

namespace App\Modules\Contacts\Repositories;

use App\Modules\Contacts\Models\ContactMessage;
use App\Modules\Contacts\Repositories\Contracts\ContactMessageRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class EloquentContactMessageRepository implements ContactMessageRepositoryInterface
{
    /** @param array<string, mixed> $data */
    public function create(array $data): ContactMessage
    {
        /** @var ContactMessage $message */
        $message = ContactMessage::query()->create($data);

        return $message;
    }

    public function listPaginated(?string $search = null, int $perPage = 50): LengthAwarePaginator
    {
        $search = trim((string) $search);

        $query = ContactMessage::query()->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search): void {
                $q->where('fullname', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    public function markRead(ContactMessage $message): ContactMessage
    {
        $message->forceFill(['is_read' => true])->save();

        return $message->fresh() ?? $message;
    }

    public function markAnswered(ContactMessage $message): ContactMessage
    {
        $message->forceFill([
            'is_read' => true,
            'is_answered' => true,
        ])->save();

        return $message->fresh() ?? $message;
    }

    public function delete(ContactMessage $message): void
    {
        $message->delete();
    }
}