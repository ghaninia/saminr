<?php

namespace App\Modules\Products\Services\Contracts;

use App\Modules\Products\DTOs\GuestProductDto;

interface GuestProductServiceInterface
{
    /** @return list<GuestProductDto> */
    public function listForGuest(): array;
}
