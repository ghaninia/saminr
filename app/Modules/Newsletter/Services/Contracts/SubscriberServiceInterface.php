<?php

namespace App\Modules\Newsletter\Services\Contracts;

use App\Modules\Newsletter\Models\Subscriber;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface SubscriberServiceInterface
{
    public function subscribe(string $fullname, string $email): Subscriber;

    public function listPaginated(?string $search = null, int $perPage = 50): LengthAwarePaginator;

    public function delete(Subscriber $subscriber): void;
}

