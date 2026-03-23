<?php

namespace App\Modules\Newsletter\Services;

use App\Modules\Newsletter\Mail\NewsletterMailable;
use App\Modules\Newsletter\Models\Newsletter;
use App\Modules\Newsletter\Models\Subscriber;
use App\Modules\Newsletter\Services\Contracts\NewsletterServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;

class NewsletterService implements NewsletterServiceInterface
{
    public function listPaginated(int $perPage = 50): LengthAwarePaginator
    {
        return Newsletter::query()->orderByDesc('id')->paginate($perPage);
    }

    public function create(string $subject, string $html): Newsletter
    {
        return Newsletter::query()->create([
            'subject' => $subject,
            'html' => $html,
            'status' => 'draft',
        ]);
    }

    public function queueSend(Newsletter $newsletter): Newsletter
    {
        if ($newsletter->status === 'queued') {
            throw new \RuntimeException('This newsletter is already queued.');
        }

        if (! Subscriber::query()->exists()) {
            throw new \RuntimeException('No subscribers found.');
        }

        $newsletter->forceFill([
            'status' => 'queued',
            'queued_at' => Carbon::now(),
            'sent_at' => null,
            'sent_count' => 0,
            'last_error' => null,
        ])->save();

        return $newsletter->fresh();
    }

    public function sendQueued(int $newsletterId): void
    {
        /** @var Newsletter|null $newsletter */
        $newsletter = Newsletter::query()->find($newsletterId);

        if (! $newsletter || $newsletter->status !== 'queued') {
            return;
        }

        $fromAddress = (string) (config('mail.from.address') ?: 'no-reply@example.com');
        $bccChunkSize = 50;
        $sent = 0;

        try {
            Subscriber::query()
                ->select(['email'])
                ->orderBy('id')
                ->chunk(500, function ($subscribers) use (&$sent, $fromAddress, $bccChunkSize, $newsletter): void {
                    $emails = $subscribers
                        ->pluck('email')
                        ->filter()
                        ->map(fn ($x) => (string) $x)
                        ->values()
                        ->all();

                    foreach (array_chunk($emails, $bccChunkSize) as $chunk) {
                        if (count($chunk) === 0) {
                            continue;
                        }

                        Mail::to($fromAddress)
                            ->bcc($chunk)
                            ->send(new NewsletterMailable((string) $newsletter->subject, (string) $newsletter->html));

                        $sent += count($chunk);
                    }
                });

            $newsletter->forceFill([
                'status' => 'sent',
                'sent_at' => now(),
                'sent_count' => $sent,
                'last_error' => null,
            ])->save();
        } catch (\Throwable $e) {
            $newsletter->forceFill([
                'status' => 'failed',
                'last_error' => $e->getMessage(),
            ])->save();

            throw $e;
        }
    }
}

