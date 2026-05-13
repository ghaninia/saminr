<?php

namespace App\Modules\Products\Repositories;

use App\Modules\Products\Models\ProductAttribute;
use App\Modules\Products\Models\ProductAttributeValue;
use App\Modules\Products\Models\Product;
use App\Modules\Products\Models\ProductVariant;
use App\Modules\Products\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class EloquentProductRepository implements ProductRepositoryInterface
{
    /** @return Collection<int, Product> */
    public function listAll(): Collection
    {
        return Product::query()
            ->with(['categories', 'attributes', 'selectedAttributeValues', 'variants.options.attribute', 'variants.options.value'])
            ->orderByDesc('id')
            ->get();
    }

    public function find(Product $product): Product
    {
        return $product->fresh(['categories', 'attributes', 'selectedAttributeValues', 'variants.options.attribute', 'variants.options.value']) ?? $product;
    }

    /** @param array<string, mixed> $data */
    public function create(array $data): Product
    {
        return DB::transaction(function () use ($data): Product {
            /** @var Product $product */
            $product = Product::query()->create(Arr::except($data, ['category_ids', 'attributes', 'variants']));

            $this->syncRelations($product, $data);

            return $product->fresh(['categories', 'attributes', 'selectedAttributeValues', 'variants.options.attribute', 'variants.options.value']) ?? $product;
        });
    }

    /** @param array<string, mixed> $data */
    public function update(Product $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data): Product {
            $product->fill(Arr::except($data, ['category_ids', 'attributes', 'variants']))->save();

            $this->syncRelations($product, $data);

            return $product->fresh(['categories', 'attributes', 'selectedAttributeValues', 'variants.options.attribute', 'variants.options.value']) ?? $product;
        });
    }

    public function delete(Product $product): void
    {
        $product->delete();
    }

    /** @param \Illuminate\Http\UploadedFile $file */
    public function upload(Product $product, \Illuminate\Http\UploadedFile $file, string $field): Product
    {
        $collection = match ($field) {
            'intro_video' => 'intro_video',
            'gallery' => 'gallery',
            default => 'cover_image',
        };

        $media = $product
            ->addMedia($file)
            ->toMediaCollection($collection);

        $url = $media->getUrl();

        if ($field === 'gallery') {
            $gallery = is_array($product->gallery) ? $product->gallery : [];
            $gallery[] = $url;
            $product->update(['gallery' => array_values(array_unique($gallery))]);
        } else {
            $product->update([$field => $url]);
        }

        return $product->fresh(['categories', 'attributes', 'selectedAttributeValues', 'variants.options.attribute', 'variants.options.value']) ?? $product;
    }

    /** @param array<string, mixed> $data */
    private function syncRelations(Product $product, array $data): void
    {
        $categoryIds = array_values(array_map('intval', (array) Arr::get($data, 'category_ids', [])));
        $product->categories()->sync($categoryIds);

        /** @var array<int, array<string, mixed>> $attributes */
        $attributes = (array) Arr::get($data, 'attributes', []);

        $resolvedAttributes = [];
        $resolvedValueIds = [];

        foreach ($attributes as $attributeData) {
            $attribute = $this->resolveOrCreateAttribute($attributeData);
            $resolvedAttributes[(string) $attribute->key] = $attribute;

            /** @var array<int, array<string, mixed>> $values */
            $values = (array) Arr::get($attributeData, 'values', []);

            foreach ($values as $valueData) {
                $value = $this->resolveOrCreateAttributeValue($attribute, $valueData);
                $resolvedValueIds[] = (int) $value->id;
            }
        }

        $product->attributes()->sync(array_values(array_map(
            static fn (ProductAttribute $attribute): int => (int) $attribute->id,
            $resolvedAttributes
        )));
        $product->selectedAttributeValues()->sync(array_values(array_unique($resolvedValueIds)));

        $product->variants()->delete();

        /** @var array<int, array<string, mixed>> $variants */
        $variants = (array) Arr::get($data, 'variants', []);

        foreach ($variants as $variantData) {
            /** @var ProductVariant $variant */
            $variant = $product->variants()->create([
                'sku' => Arr::get($variantData, 'sku') !== null ? (string) Arr::get($variantData, 'sku') : null,
                'price' => (float) Arr::get($variantData, 'price', 0),
                'is_default' => (bool) Arr::get($variantData, 'is_default', false),
                'sort_order' => (int) Arr::get($variantData, 'sort_order', 0),
            ]);

            /** @var array<int, array<string, mixed>> $options */
            $options = (array) Arr::get($variantData, 'options', []);

            foreach ($options as $optionData) {
                $attributeKey = (string) Arr::get($optionData, 'attribute_key', '');
                $valueText = (string) Arr::get($optionData, 'value', '');

                if ($attributeKey === '' || $valueText === '') {
                    continue;
                }

                $attribute = $resolvedAttributes[$attributeKey] ?? ProductAttribute::query()->where('key', $attributeKey)->first();

                if (! $attribute instanceof ProductAttribute) {
                    continue;
                }

                $value = ProductAttributeValue::query()
                    ->where('product_attribute_id', $attribute->id)
                    ->where('value', $valueText)
                    ->first();

                if (! $value instanceof ProductAttributeValue) {
                    $value = $attribute->values()->create([
                        'value' => $valueText,
                        'sort_order' => 0,
                    ]);
                }

                $variant->options()->create([
                    'product_attribute_id' => $attribute->id,
                    'product_attribute_value_id' => $value->id,
                ]);
            }
        }
    }

    /** @param array<string, mixed> $attributeData */
    private function resolveOrCreateAttribute(array $attributeData): ProductAttribute
    {
        $attributeId = Arr::get($attributeData, 'id');
        $key = (string) Arr::get($attributeData, 'key', '');

        $attribute = null;

        if ($attributeId !== null) {
            $attribute = ProductAttribute::query()->find((int) $attributeId);
        }

        if (! $attribute instanceof ProductAttribute && $key !== '') {
            $attribute = ProductAttribute::query()->where('key', $key)->first();
        }

        if (! $attribute instanceof ProductAttribute) {
            /** @var ProductAttribute $created */
            $created = ProductAttribute::query()->create([
                'key' => $key,
                'label' => (array) Arr::get($attributeData, 'label', ['fa' => '', 'en' => '']),
                'value_type' => (string) Arr::get($attributeData, 'value_type', 'select'),
                'sort_order' => (int) Arr::get($attributeData, 'sort_order', 0),
            ]);

            return $created;
        }

        $attribute->fill([
            'label' => (array) Arr::get($attributeData, 'label', $attribute->label),
            'value_type' => (string) Arr::get($attributeData, 'value_type', $attribute->value_type),
            'sort_order' => (int) Arr::get($attributeData, 'sort_order', $attribute->sort_order),
        ])->save();

        return $attribute;
    }

    /** @param array<string, mixed> $valueData */
    private function resolveOrCreateAttributeValue(ProductAttribute $attribute, array $valueData): ProductAttributeValue
    {
        $valueId = Arr::get($valueData, 'id');
        $valueText = (string) Arr::get($valueData, 'value', '');

        $value = null;

        if ($valueId !== null) {
            $value = ProductAttributeValue::query()->where('product_attribute_id', $attribute->id)->find((int) $valueId);
        }

        if (! $value instanceof ProductAttributeValue && $valueText !== '') {
            $value = ProductAttributeValue::query()
                ->where('product_attribute_id', $attribute->id)
                ->where('value', $valueText)
                ->first();
        }

        if (! $value instanceof ProductAttributeValue) {
            /** @var ProductAttributeValue $created */
            $created = $attribute->values()->create([
                'value' => $valueText,
                'meta' => is_array(Arr::get($valueData, 'meta')) ? Arr::get($valueData, 'meta') : null,
                'sort_order' => (int) Arr::get($valueData, 'sort_order', 0),
            ]);

            return $created;
        }

        $value->fill([
            'value' => $valueText,
            'meta' => is_array(Arr::get($valueData, 'meta')) ? Arr::get($valueData, 'meta') : $value->meta,
            'sort_order' => (int) Arr::get($valueData, 'sort_order', $value->sort_order),
        ])->save();

        return $value;
    }
}
