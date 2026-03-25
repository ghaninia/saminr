<?php

namespace App\Modules\Reviews\Repositories\Contracts;

use App\Modules\Reviews\Models\Review;
use Illuminate\Database\Eloquent\Collection;

interface ReviewRepositoryInterface
{
    /** @return Collection<int, Review> */
    public function listAll(): Collection;

    /** @param array<string, mixed> $data */
    public function create(array $data): Review;

    /** @param array<string, mixed> $data */
    public function update(Review $review, array $data): Review;

    public function delete(Review $review): void;

    /**
     * Upload a file to the avatar media collection, persist the URL on the model, and return it.
     *
     * @param  \Illuminate\Http\UploadedFile  $file
     */
    public function uploadAvatar(Review $review, \Illuminate\Http\UploadedFile $file): string;
}
