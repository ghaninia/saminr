<?php

namespace App\Modules\Products\Services\Contracts;

use App\Modules\Products\Models\Product;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

interface ProductServiceInterface
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

    /**
     * @return array{url: string|null, product: Product}
     */
    public function uploadMedia(Product $product, UploadedFile $file, string $field): array;

    public function deleteMedia(Product $product, string $field, ?int $index): Product;
}
