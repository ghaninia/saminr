<?php

namespace App\Modules\Categories\Services;

use App\Modules\Categories\Models\Category;
use App\Modules\Categories\Repositories\Contracts\CategoryRepositoryInterface;
use App\Modules\Categories\Services\Contracts\CategoryServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

class CategoryService implements CategoryServiceInterface
{
    public function __construct(
        private readonly CategoryRepositoryInterface $categoryRepository,
    ) {}

    /** @return Collection<int, Category> */
    public function listAll(bool $ascending = false): Collection
    {
        return $this->categoryRepository->listAll($ascending);
    }

    /** @param array<string, mixed> $data */
    public function create(array $data): Category
    {
        return $this->categoryRepository->create($data);
    }

    /** @param array<string, mixed> $data */
    public function update(Category $category, array $data): Category
    {
        return $this->categoryRepository->update($category, $data);
    }

    public function delete(Category $category): void
    {
        $this->categoryRepository->delete($category);
    }

    /** @return array{url: string, category: Category} */
    public function upload(Category $category, UploadedFile $file, string $field): array
    {
        $updated = $this->categoryRepository->upload($category, $file, $field);

        return [
            'url'      => (string) ($updated->{$field} ?? ''),
            'category' => $updated,
        ];
    }
}
