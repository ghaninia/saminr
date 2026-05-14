<?php

namespace App\Modules\Categories\Repositories;

use App\Modules\Categories\Models\Category;
use App\Modules\Categories\Repositories\Contracts\CategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

class EloquentCategoryRepository implements CategoryRepositoryInterface
{
    /** @return Collection<int, Category> */
    public function listAll(bool $ascending = false): Collection
    {
        return Category::query()
            ->orderBy('id', $ascending ? 'asc' : 'desc')
            ->get();
    }

    /** @param array<string, mixed> $data */
    public function create(array $data): Category
    {
        /** @var Category $category */
        $category = Category::query()->create($data);

        return $category;
    }

    /** @param array<string, mixed> $data */
    public function update(Category $category, array $data): Category
    {
        $category->fill($data)->save();

        return $category->fresh() ?? $category;
    }

    public function delete(Category $category): void
    {
        $category->delete();
    }

    public function upload(Category $category, UploadedFile $file, string $field): Category
    {
        $media = $category
            ->addMedia($file)
            ->toMediaCollection($field);

        $url = $media->getUrl();

        $category->update([$field => $url]);

        return $category->fresh() ?? $category;
    }
}
