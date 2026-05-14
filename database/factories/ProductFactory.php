<?php

namespace Database\Factories;

use App\Modules\Categories\Models\Category;
use App\Modules\Products\Models\Product;
use App\Modules\Products\Models\ProductAttribute;
use App\Modules\Products\Models\ProductVariant;
use App\Modules\Products\Models\ProductVariantOption;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Product> */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        $name = fake()->unique()->words(fake()->numberBetween(2, 4), true);
        $basePrice = fake()->randomFloat(2, 5, 80);

        return [
            'title' => [
                'fa' => 'محصول '.fake()->numberBetween(100, 999),
                'en' => Str::title($name),
            ],
            'subtitle' => [
                'fa' => 'نسخه ویژه',
                'en' => fake()->sentence(3),
            ],
            'description' => [
                'fa' => 'توضیحات نمونه برای محصول فیک.',
                'en' => fake()->sentences(2, true),
            ],
            'short_link' => Str::slug($name.'-'.Str::lower(Str::random(6))),
            'base_price' => $basePrice,
            'cover_image' => null,
            'intro_video' => null,
            'gallery' => [],
            'is_active' => true,
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Product $product): void {
            $categoryIds = Category::query()
                ->inRandomOrder()
                ->limit(random_int(1, 3))
                ->pluck('id')
                ->all();

            if ($categoryIds !== []) {
                $product->categories()->syncWithoutDetaching($categoryIds);
            }

            $attributes = ProductAttribute::query()
                ->with('values')
                ->whereHas('values')
                ->inRandomOrder()
                ->limit(random_int(2, 4))
                ->get();

            if ($attributes->isNotEmpty()) {
                $product->attributes()->syncWithoutDetaching($attributes->pluck('id')->all());
            }

            $variantCount = random_int(2, 5);
            $selectedValueIds = [];

            for ($variantIndex = 0; $variantIndex < $variantCount; $variantIndex++) {
                $unitType = fake()->randomElement(['numeric', 'numeric', 'numeric', 'infinite', 'contact']);
                $basePrice = (float) $product->base_price;
                $price = max(0, $basePrice + fake()->randomFloat(2, -8, 25));

                $variant = ProductVariant::query()->create([
                    'product_id' => $product->id,
                    'unit_type' => $unitType,
                    'unit' => $unitType === 'numeric' ? (string) random_int(1, 99) : null,
                    'price' => round($price, 2),
                    'is_default' => $variantIndex === 0,
                    'sort_order' => $variantIndex,
                ]);

                foreach ($attributes as $attribute) {
                    $value = $attribute->values->random();

                    ProductVariantOption::query()->create([
                        'product_variant_id' => $variant->id,
                        'product_attribute_id' => $attribute->id,
                        'product_attribute_value_id' => $value->id,
                    ]);

                    $selectedValueIds[] = $value->id;
                }
            }

            if ($selectedValueIds !== []) {
                $product->selectedAttributeValues()->syncWithoutDetaching(array_values(array_unique($selectedValueIds)));
            }
        });
    }
}
