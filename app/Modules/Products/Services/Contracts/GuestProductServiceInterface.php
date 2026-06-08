<?php

namespace App\Modules\Products\Services\Contracts;

use App\Modules\Products\DTOs\GuestProductDto;

interface GuestProductServiceInterface
{
    /** @return list<GuestProductDto> */
    public function listForGuest(): array;

    /**
     * @param  list<string> $categorySlugs
     * @return list<GuestProductDto>
     */
    public function listForGuestByCategories(array $categorySlugs): array;

    public function findForGuest(string $shortLink): ?GuestProductDto;
}
