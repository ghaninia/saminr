<?php

namespace App\Modules\Products\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Products\Models\Product */
class ProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'description' => $this->description,
            'short_link' => $this->short_link,
            'base_price' => $this->base_price,
            'cover_image' => $this->getMediaForCollection('cover_image'),
            'intro_video' => $this->getMediaForCollection('intro_video'),
            'gallery' => $this->getMediaForCollection('gallery', true),
            'is_active' => $this->is_active,
            'categories' => $this->whenLoaded('categories', function () {
                return $this->categories->map(fn ($category): array => [
                    'id' => $category->id,
                    'title' => $category->title,
                    'short_link' => $category->short_link,
                    'image' => $category->image,
                ])->values();
            }, []),
            'category_ids' => $this->whenLoaded('categories', fn () => $this->categories->pluck('id')->values(), []),
            'attributes' => $this->whenLoaded('attributes', function () {
                $selectedValues = $this->relationLoaded('selectedAttributeValues')
                    ? $this->selectedAttributeValues->groupBy('product_attribute_id')
                    : collect();

                return $this->attributes->map(fn ($attribute): array => [
                    'id' => $attribute->id,
                    'key' => $attribute->key,
                    'label' => $attribute->label,
                    'icon_svg' => $attribute->icon_svg,
                    'value_type' => $attribute->value_type,
                    'sort_order' => $attribute->sort_order,
                    'values' => ($selectedValues->get($attribute->id) ?? collect())->map(function ($value): array {
                            $valueI18n = $this->decodeLocalizedValue((string) $value->value);

                            return [
                                'id' => $value->id,
                                'value' => $this->canonicalValueFromLocalized($valueI18n),
                                'value_i18n' => $valueI18n,
                                'meta' => $value->meta,
                                'sort_order' => $value->sort_order,
                            ];
                        })->values()
                        ->all(),
                ])->values();
            }, []),
            'variants' => $this->whenLoaded('variants', function () {
                return $this->variants->map(fn ($variant): array => [
                    'id' => $variant->id,
                    'unit_type' => $variant->unit_type,
                    'unit' => $variant->unit,
                    'price' => $variant->price,
                    'is_default' => $variant->is_default,
                    'sort_order' => $variant->sort_order,
                    'options' => $variant->relationLoaded('options')
                        ? $variant->options->map(fn ($option): array => [
                            'attribute_id' => $option->product_attribute_id,
                            'attribute_key' => $option->attribute?->key,
                            'attribute_label' => $option->attribute?->label,
                            'attribute_icon_svg' => $option->attribute?->icon_svg,
                            'value_id' => $option->product_attribute_value_id,
                            'value' => $option->value ? $this->canonicalValueFromLocalized($this->decodeLocalizedValue((string) $option->value->value)) : null,
                            'value_i18n' => $option->value ? $this->decodeLocalizedValue((string) $option->value->value) : null,
                        ])->values()
                        : [],
                ])->values();
            }, []),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * Get media for a collection as formatted array
     */
    private function getMediaForCollection(string $collection, bool $isArray = false): array|object|null
    {
        $media = $this->getMedia($collection);

        if ($isArray) {
            return $media->map(fn ($item) => [
                'id' => $item->id,
                'file_name' => $item->file_name,
                'original_url' => $item->getUrl(),
            ])->values()->all();
        }

        if ($media->isEmpty()) {
            return null;
        }

        $first = $media->first();
        return [
            'id' => $first->id,
            'file_name' => $first->file_name,
            'original_url' => $first->getUrl(),
        ];
    }

    /** @return array{fa: string, en: string} */
    private function decodeLocalizedValue(string $raw): array
    {
        $decoded = json_decode($raw, true);
        if (is_array($decoded) && array_key_exists('fa', $decoded) && array_key_exists('en', $decoded)) {
            return [
                'fa' => (string) ($decoded['fa'] ?? ''),
                'en' => (string) ($decoded['en'] ?? ''),
            ];
        }

        return [
            'fa' => $raw,
            'en' => $raw,
        ];
    }

    /** @param array{fa: string, en: string} $localized */
    private function canonicalValueFromLocalized(array $localized): string
    {
        return trim((string) ($localized['en'] !== '' ? $localized['en'] : $localized['fa']));
    }
}
