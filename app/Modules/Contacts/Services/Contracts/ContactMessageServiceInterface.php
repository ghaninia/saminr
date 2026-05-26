<?php

namespace App\Modules\Contacts\Services\Contracts;

use App\Modules\Contacts\Models\ContactMessage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ContactMessageServiceInterface
{
    public function create(string $fullname, string $email, string $content): ContactMessage;

    public function listPaginated(?string $search = null, int $perPage = 50): LengthAwarePaginator;

    public function markRead(ContactMessage $message): ContactMessage;

    public function reply(ContactMessage $message, string $replyContent): ContactMessage;

    public function delete(ContactMessage $message): void;
}
