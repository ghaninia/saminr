<?php

namespace App\Modules\Products\Repositories\Contracts;

use App\Modules\Products\Models\Product;
use Illuminate\Database\Eloquent\Collection;

interface GuestProductRepositoryInterface
{
    /** @return Collection<int, Product> */
    public function listActive(): Collection;

    /**
     * @param  list<string> $shortLinks category slugs
     * @return Collection<int, Product>
     */
    public function listActiveByCategories(array $shortLinks): Collection;

    public function findActiveByShortLink(string $shortLink): ?Product;
}
