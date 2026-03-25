<?php

namespace App\Modules\Reviews\Services;

use App\Modules\Reviews\Models\Review;
use App\Modules\Reviews\Repositories\Contracts\ReviewRepositoryInterface;
use App\Modules\Reviews\Services\Contracts\ReviewServiceInterface;
use Illuminate\Database\Eloquent\Collection;

class ReviewService implements ReviewServiceInterface
{
    public function __construct(
        private readonly ReviewRepositoryInterface $reviewRepository,
    ) {}

    /** @return Collection<int, Review> */
    public function listAll(): Collection
    {
        return $this->reviewRepository->listAll();
    }

    /** @param array<string, mixed> $data */
    public function create(array $data): Review
    {
        return $this->reviewRepository->create($data);
    }

    /** @param array<string, mixed> $data */
    public function update(Review $review, array $data): Review
    {
        return $this->reviewRepository->update($review, $data);
    }

    public function delete(Review $review): void
    {
        $this->reviewRepository->delete($review);
    }

    public function uploadAvatar(Review $review, \Illuminate\Http\UploadedFile $file): string
    {
        return $this->reviewRepository->uploadAvatar($review, $file);
    }
}
