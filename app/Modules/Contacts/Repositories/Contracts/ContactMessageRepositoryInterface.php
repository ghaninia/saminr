<?php

namespace App\Modules\Contacts\Repositories\Contracts;

use App\Modules\Contacts\Models\ContactMessage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ContactMessageRepositoryInterface
{
    /** @param array<string, mixed> $data */
    public function create(array $data): ContactMessage;

    public function listPaginated(?string $search = null, int $perPage = 50): LengthAwarePaginator;

    public function markRead(ContactMessage $message): ContactMessage;

    public function markAnswered(ContactMessage $message): ContactMessage;

    public function delete(ContactMessage $message): void;
}