<?php

namespace App\Modules\Products\Services;

use App\Modules\Products\Models\Product;
use App\Modules\Products\Repositories\Contracts\ProductRepositoryInterface;
use App\Modules\Products\Services\Contracts\ProductServiceInterface;
use Illuminate\Database\Eloquent\Collection;

class ProductService implements ProductServiceInterface
{
    public function __construct(
        private readonly ProductRepositoryInterface $productRepository,
    ) {}

    /** @return Collection<int, Product> */
    public function listAll(): Collection
    {
        return $this->productRepository->listAll();
    }

    public function find(Product $product): Product
    {
        return $this->productRepository->find($product);
    }

    /** @param array<string, mixed> $data */
    public function create(array $data): Product
    {
        return $this->productRepository->create($data);
    }

    /** @param array<string, mixed> $data */
    public function update(Product $product, array $data): Product
    {
        return $this->productRepository->update($product, $data);
    }

    public function delete(Product $product): void
    {
        $this->productRepository->delete($product);
    }

    /** @param \Illuminate\Http\UploadedFile $file */
    public function upload(Product $product, \Illuminate\Http\UploadedFile $file, string $field): Product
    {
        return $this->productRepository->upload($product, $file, $field);
    }
}
