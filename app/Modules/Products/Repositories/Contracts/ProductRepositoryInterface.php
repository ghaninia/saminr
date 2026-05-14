<?php

namespace App\Modules\Products\Repositories\Contracts;

use App\Modules\Products\Models\Product;
use App\Modules\Products\Models\ProductAttribute;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

interface ProductRepositoryInterface
{
    /** @return Collection<int, Product> */
    public function listAll(): Collection;

    public function find(Product $product): Product;

    /** @param array<string, mixed> $data */
    public function create(array $data): Product;

    /** @param array<string, mixed> $data */
    public function update(Product $product, array $data): Product;

    public function setStatus(Product $product, bool $isActive): Product;

    public function delete(Product $product): void;

    /** @param \Illuminate\Http\UploadedFile $file */
    public function upload(Product $product, \Illuminate\Http\UploadedFile $file, string $field): Product;

    public function deleteMedia(Product $product, string $field, ?int $index): Product;

    public function resolveMediaUrl(Product $product, string $field): ?string;

    /** @return Collection<int, ProductAttribute> */
    public function listAttributes(): Collection;
}
