<?php

namespace App\Modules\Contacts\Services;

use App\Modules\Contacts\Mail\ContactReplyMailable;
use App\Modules\Contacts\Models\ContactMessage;
use App\Modules\Contacts\Repositories\Contracts\ContactMessageRepositoryInterface;
use App\Modules\Contacts\Services\Contracts\ContactMessageServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Mail;

class ContactMessageService implements ContactMessageServiceInterface
{
    public function __construct(
        private readonly ContactMessageRepositoryInterface $contactMessageRepository,
    ) {
    }

    public function create(string $fullname, string $email, string $content): ContactMessage
    {
        return $this->contactMessageRepository->create([
            'fullname' => $fullname,
            'email' => $email,
            'content' => $content,
        ]);
    }

    public function listPaginated(?string $search = null, int $perPage = 50): LengthAwarePaginator
    {
        return $this->contactMessageRepository->listPaginated($search, $perPage);
    }

    public function markRead(ContactMessage $message): ContactMessage
    {
        return $this->contactMessageRepository->markRead($message);
    }

    public function reply(ContactMessage $message, string $replyContent): ContactMessage
    {
        Mail::to($message->email)->send(new ContactReplyMailable(
            originalFullname: (string) $message->fullname,
            replyContent: $replyContent,
        ));

        return $this->contactMessageRepository->markAnswered($message);
    }

    public function delete(ContactMessage $message): void
    {
        $this->contactMessageRepository->delete($message);
    }
}
