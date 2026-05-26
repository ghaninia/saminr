<?php

namespace App\Modules\Contacts\Services;

use App\Modules\Contacts\Mail\ContactReplyMailable;
use App\Modules\Contacts\Models\ContactMessage;
use App\Modules\Contacts\Services\Contracts\ContactMessageServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Mail;

class ContactMessageService implements ContactMessageServiceInterface
{
    public function create(string $fullname, string $email, string $content): ContactMessage
    {
        /** @var ContactMessage $message */
        $message = ContactMessage::query()->create([
            'fullname' => $fullname,
            'email' => $email,
            'content' => $content,
        ]);

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

    public function reply(ContactMessage $message, string $replyContent): ContactMessage
    {
        Mail::to($message->email)->send(new ContactReplyMailable(
            originalFullname: (string) $message->fullname,
            replyContent: $replyContent,
        ));

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
