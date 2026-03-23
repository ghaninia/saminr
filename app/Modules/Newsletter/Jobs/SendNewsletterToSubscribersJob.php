<?php

namespace App\Modules\Newsletter\Jobs;

use App\Modules\Newsletter\Services\Contracts\NewsletterServiceInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendNewsletterToSubscribersJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(public readonly int $newsletterId)
    {
    }

    public function handle(NewsletterServiceInterface $newsletterService): void
    {
        $newsletterService->sendQueued($this->newsletterId);
    }
}
