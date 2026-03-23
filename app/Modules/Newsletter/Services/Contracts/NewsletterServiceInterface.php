<?php

namespace App\Modules\Newsletter\Services\Contracts;

use App\Modules\Newsletter\Models\Newsletter;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface NewsletterServiceInterface
{
    public function listPaginated(int $perPage = 50): LengthAwarePaginator;

    public function create(string $subject, string $html): Newsletter;

    /**
     * @throws \RuntimeException
     */
    public function queueSend(Newsletter $newsletter): Newsletter;

    public function sendQueued(int $newsletterId): void;
}

