<?php

namespace App\Modules\Products\Services;

use App\Modules\Products\Models\Product;
use App\Modules\Products\Models\ProductAttribute;
use App\Modules\Products\Repositories\Contracts\ProductRepositoryInterface;
use App\Modules\Products\Services\Contracts\ProductServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

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

    public function setStatus(Product $product, bool $isActive): Product
    {
        return $this->productRepository->setStatus($product, $isActive);
    }

    public function delete(Product $product): void
    {
        $this->productRepository->delete($product);
    }

    /**
     * @return array{url: string|null, product: Product}
     */
    public function uploadMedia(Product $product, UploadedFile $file, string $field): array
    {
        $updated = $this->productRepository->upload($product, $file, $field);

        return [
            'url' => $this->productRepository->resolveMediaUrl($updated, $field),
            'product' => $updated,
        ];
    }

    public function deleteMedia(Product $product, string $field, ?int $index): Product
    {
        return $this->productRepository->deleteMedia($product, $field, $index);
    }

    /** @return Collection<int, ProductAttribute> */
    public function listAttributes(): Collection
    {
        return $this->productRepository->listAttributes();
    }
}
