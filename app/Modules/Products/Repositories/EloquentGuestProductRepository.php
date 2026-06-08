<?php

namespace App\Modules\Products\Repositories;

use App\Modules\Products\Models\Product;
use App\Modules\Products\Repositories\Contracts\GuestProductRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class EloquentGuestProductRepository implements GuestProductRepositoryInterface
{
    /** @return Collection<int, Product> */
    public function listActive(): Collection
    {
        return Product::query()
            ->where('is_active', true)
            ->with([
                'categories',
                'variants.options.attribute',
                'variants.options.value',
                'media',
            ])
            ->orderByDesc('id')
            ->limit(9)
            ->get();
    }

    /**
     * @param  list<string> $shortLinks
     * @return Collection<int, Product>
     */
    public function listActiveByCategories(array $shortLinks): Collection
    {
        return Product::query()
            ->where('is_active', true)
            ->whereHas('categories', fn ($q) => $q->whereIn('categories.short_link', $shortLinks))
            ->with([
                'categories',
                'variants.options.attribute',
                'variants.options.value',
                'media',
            ])
            ->orderByDesc('id')
            ->get();
    }

    public function findActiveByShortLink(string $shortLink): ?Product
    {
        return Product::query()
            ->where('is_active', true)
            ->where('short_link', $shortLink)
            ->with([
                'categories',
                'variants.options.attribute',
                'variants.options.value',
                'media',
            ])
            ->first();
    }
}
