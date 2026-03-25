<?php

namespace App\Modules\Reviews\Services\Contracts;

use App\Modules\Reviews\Models\Review;
use Illuminate\Database\Eloquent\Collection;

interface ReviewServiceInterface
{
    /** @return Collection<int, Review> */
    public function listAll(): Collection;

    /** @param array<string, mixed> $data */
    public function create(array $data): Review;

    /** @param array<string, mixed> $data */
    public function update(Review $review, array $data): Review;

    public function delete(Review $review): void;
}
