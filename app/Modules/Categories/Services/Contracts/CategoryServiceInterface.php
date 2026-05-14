<?php

namespace App\Modules\Categories\Services\Contracts;

use App\Modules\Categories\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

interface CategoryServiceInterface
{
    /** @return Collection<int, Category> */
    public function listAll(bool $ascending = false): Collection;

    /** @param array<string, mixed> $data */
    public function create(array $data): Category;

    /** @param array<string, mixed> $data */
    public function update(Category $category, array $data): Category;

    public function delete(Category $category): void;

    /** @return array{url: string, category: Category} */
    public function upload(Category $category, UploadedFile $file, string $field): array;
}
