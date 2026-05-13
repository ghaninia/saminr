<?php

namespace App\Modules\Products\Repositories\Contracts;

use App\Modules\Products\Models\Product;
use Illuminate\Database\Eloquent\Collection;

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
}
