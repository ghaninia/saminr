<?php

namespace App\Modules\Products\Services;

use App\Modules\Products\DTOs\GuestProductDto;
use App\Modules\Products\DTOs\GuestProductVariantDto;
use App\Modules\Products\Models\Product;
use App\Modules\Products\Models\ProductAttribute;
use App\Modules\Products\Models\ProductVariant;
use App\Modules\Products\Models\ProductVariantOption;
use App\Modules\Products\Repositories\Contracts\GuestProductRepositoryInterface;
use App\Modules\Products\Services\Contracts\GuestProductServiceInterface;

class GuestProductService implements GuestProductServiceInterface
{
    public function __construct(
        private readonly GuestProductRepositoryInterface $guestProductRepository,
    ) {}

    /** @return list<GuestProductDto> */
    public function listForGuest(): array
    {
        $products = $this->guestProductRepository->listActive();

        return $products->map(function (Product $product): GuestProductDto {
            $variants = $product->variants->map(function (ProductVariant $variant): GuestProductVariantDto {
                $attributes = $variant->options
                    ->map(fn (ProductVariantOption $option): ?array => $this->mapVariantAttribute($option))
                    ->filter(static fn (?array $item): bool => $item !== null)
                    ->values()
                    ->all();

                $colorAttribute = collect($attributes)
                    ->first(static fn (array $attribute): bool => $attribute['is_color']);

                return new GuestProductVariantDto(
                    id: (int) $variant->id,
                    price: (float) $variant->price,
                    sku: $variant->sku,
                    skuType: (string) $variant->sku_type,
                    isDefault: (bool) $variant->is_default,
                    color: $colorAttribute['value'] ?? null,
                    colorSwatch: $this->extractColorSwatch($variant, $colorAttribute),
                    attributes: $attributes,
                );
            })->values()->all();

            $defaultVariant = collect($variants)->first(
                static fn (GuestProductVariantDto $variant): bool => $variant->isDefault,
            ) ?? ($variants[0] ?? null);

            $colorMap = [];
            foreach ($variants as $variant) {
                if ($variant->color === null) {
                    continue;
                }

                $colorAttr = collect($variant->attributes)
                    ->first(static fn (array $attribute): bool => ($attribute['is_color'] ?? false) === true && (string) ($attribute['value'] ?? '') === $variant->color);

                $colorI18n = is_array($colorAttr['value_i18n'] ?? null)
                    ? [
                        'fa' => (string) ($colorAttr['value_i18n']['fa'] ?? $variant->color),
                        'en' => (string) ($colorAttr['value_i18n']['en'] ?? $variant->color),
                    ]
                    : [
                        'fa' => $variant->color,
                        'en' => $variant->color,
                    ];

                $colorMap[$variant->color] = [
                    'name' => $variant->color,
                    'name_i18n' => $colorI18n,
                    'swatch' => $variant->colorSwatch,
                ];
            }

            $colors = array_values($colorMap);

            $summaryAttributes = $this->buildSummaryAttributes($variants, $defaultVariant);

            return new GuestProductDto(
                id: (int) $product->id,
                title: $product->title,
                subtitle: $product->subtitle,
                description: $product->description,
                shortLink: $product->short_link,
                image: $this->resolveImage($product),
                defaultVariant: $defaultVariant,
                colors: $colors,
                variants: $variants,
                summaryAttributes: $summaryAttributes,
            );
        })->values()->all();
    }

    private function resolveImage(Product $product): ?string
    {
        $cover = $product->getFirstMediaUrl('cover_image');

        if ($cover !== '') {
            return $cover;
        }

        return $product->cover_image;
    }

    private function extractColorSwatch(ProductVariant $variant, ?array $colorAttribute): ?string
    {
        if ($colorAttribute === null) {
            return null;
        }

        $colorOption = $variant->options->first(function (ProductVariantOption $option): bool {
            $attribute = $option->attribute;

            return $attribute instanceof ProductAttribute && $this->isColorAttribute($attribute);
        });

        $meta = is_array($colorOption?->value?->meta) ? $colorOption->value->meta : [];

        $candidates = [
            $meta['color'] ?? null,
            $meta['hex'] ?? null,
            $meta['code'] ?? null,
            $meta['value'] ?? null,
        ];

        foreach ($candidates as $candidate) {
            $hex = $this->normalizeHexColor($candidate);
            if ($hex !== null) {
                return $hex;
            }
        }

        return $this->normalizeHexColor($colorAttribute['value']);
    }

    private function normalizeHexColor(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $candidate = trim($value);

        if ($candidate === '') {
            return null;
        }

        if (! str_starts_with($candidate, '#')) {
            $candidate = '#'.$candidate;
        }

        if (preg_match('/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/', $candidate) !== 1) {
            return null;
        }

        return strtoupper($candidate);
    }

    /** @return array{key: string, label: array|string, value: string, value_i18n: array|null, is_color: bool, icon_svg: string|null}|null */
    private function mapVariantAttribute(ProductVariantOption $option): ?array
    {
        $attribute = $option->attribute;
        $valueI18n = $this->decodeLocalizedValue((string) ($option->value?->value ?? ''));
        $value = $this->canonicalValueFromLocalized($valueI18n);

        if (! $attribute instanceof ProductAttribute || $value === '') {
            return null;
        }

        return [
            'key' => (string) $attribute->key,
            'label' => $attribute->label,
            'value' => $value,
            'value_i18n' => $valueI18n,
            'is_color' => $this->isColorAttribute($attribute),
            'icon_svg' => $attribute->icon_svg,
        ];
    }

    private function resolveAttributeLabel(ProductAttribute $attribute): string
    {
        $fa = trim((string) ($attribute->label['fa'] ?? ''));
        $en = trim((string) ($attribute->label['en'] ?? ''));

        return $fa !== '' ? $fa : ($en !== '' ? $en : (string) $attribute->key);
    }

    /** @param list<GuestProductVariantDto> $variants
     *  @return list<array{key: string, label: string, icon_svg: string|null, values: list<string>, default_value: string|null}>
     */
    private function buildSummaryAttributes(array $variants, ?GuestProductVariantDto $defaultVariant): array
    {
        $summary = [];

        foreach ($variants as $variant) {
            foreach ($variant->attributes as $attribute) {
                if (($attribute['is_color'] ?? false) === true) {
                    continue;
                }

                $key = (string) ($attribute['key'] ?? '');
                $label = is_array($attribute['label'] ?? null) ? $attribute['label'] : ['fa' => (string) ($attribute['label'] ?? $key), 'en' => (string) ($attribute['label'] ?? $key)];
                $value = (string) ($attribute['value'] ?? '');
                $valueI18n = is_array($attribute['value_i18n'] ?? null) ? $attribute['value_i18n'] : ['fa' => $value, 'en' => $value];

                if ($key === '' || $value === '') {
                    continue;
                }

                if (! isset($summary[$key])) {
                    $summary[$key] = [
                        'key' => $key,
                        'label' => $label,
                        'icon_svg' => (string) ($attribute['icon_svg'] ?? '') !== '' ? (string) $attribute['icon_svg'] : null,
                        'values' => [],
                        'values_i18n' => [],
                        'default_value' => null,
                        'default_value_i18n' => null,
                    ];
                }

                if (! in_array($value, $summary[$key]['values'], true)) {
                    $summary[$key]['values'][] = $value;
                    $summary[$key]['values_i18n'][] = [
                        'fa' => (string) ($valueI18n['fa'] ?? $value),
                        'en' => (string) ($valueI18n['en'] ?? $value),
                    ];
                }
            }
        }

        if ($defaultVariant !== null) {
            foreach ($defaultVariant->attributes as $attribute) {
                if (($attribute['is_color'] ?? false) === true) {
                    continue;
                }

                $key = (string) ($attribute['key'] ?? '');
                $value = (string) ($attribute['value'] ?? '');
                $valueI18n = is_array($attribute['value_i18n'] ?? null) ? $attribute['value_i18n'] : ['fa' => $value, 'en' => $value];

                if ($key === '' || $value === '' || ! isset($summary[$key])) {
                    continue;
                }

                $summary[$key]['default_value'] = $value;
                $summary[$key]['default_value_i18n'] = [
                    'fa' => (string) ($valueI18n['fa'] ?? $value),
                    'en' => (string) ($valueI18n['en'] ?? $value),
                ];
            }
        }

        return array_values($summary);
    }

    private function isColorAttribute(ProductAttribute $attribute): bool
    {
        $key = strtolower((string) $attribute->key);

        if ($key === 'color' || $key === 'colour') {
            return true;
        }

        $labelFa = strtolower(trim((string) ($attribute->label['fa'] ?? '')));
        $labelEn = strtolower(trim((string) ($attribute->label['en'] ?? '')));

        return str_contains($labelFa, 'رنگ') || str_contains($labelEn, 'color') || str_contains($labelEn, 'colour');
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
