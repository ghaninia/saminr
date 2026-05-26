<?php

namespace App\Modules\Contacts\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactReplyMailable extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(
        public readonly string $originalFullname,
        public readonly string $replyContent,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: __('responses.contact.reply_subject'));
    }

    public function content(): Content
    {
        $name = htmlspecialchars($this->originalFullname, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $body = nl2br(htmlspecialchars($this->replyContent, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));

        $html = "<p>Dear {$name},</p><p>{$body}</p>";

        return new Content(htmlString: $html);
    }
}
