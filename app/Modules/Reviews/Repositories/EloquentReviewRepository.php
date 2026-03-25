<?php

namespace App\Modules\Reviews\Repositories;

use App\Modules\Reviews\Models\Review;
use App\Modules\Reviews\Repositories\Contracts\ReviewRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class EloquentReviewRepository implements ReviewRepositoryInterface
{
    /** @return Collection<int, Review> */
    public function listAll(): Collection
    {
        return Review::query()->orderByDesc('id')->get();
    }

    /** @param array<string, mixed> $data */
    public function create(array $data): Review
    {
        /** @var Review $review */
        $review = Review::query()->create($data);

        return $review;
    }

    /** @param array<string, mixed> $data */
    public function update(Review $review, array $data): Review
    {
        $review->fill($data)->save();

        return $review->fresh() ?? $review;
    }

    public function delete(Review $review): void
    {
        $review->delete();
    }
}
