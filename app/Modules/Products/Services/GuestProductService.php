<?php

namespace App\Modules\Products\Services;

use App\Modules\Products\DTOs\GuestProductDto;
use App\Modules\Products\DTOs\GuestProductVariantDto;
use App\Modules\Products\DTOs\ProductColorDto;
use App\Modules\Products\DTOs\SummaryAttributeDto;
use App\Modules\Products\DTOs\VariantAttributeDto;
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

        return $products
            ->map(fn (Product $product): GuestProductDto => $this->mapProduct($product, limitSummaryAttributes: true))
            ->values()
            ->all();
    }

    /**
     * @param  list<string> $categorySlugs
     * @return list<GuestProductDto>
     */
    public function listForGuestByCategories(array $categorySlugs): array
    {
        $products = $this->guestProductRepository->listActiveByCategories($categorySlugs);

        return $products
            ->map(fn (Product $product): GuestProductDto => $this->mapProduct($product, limitSummaryAttributes: true))
            ->values()
            ->all();
    }

    public function findForGuest(string $shortLink): ?GuestProductDto
    {
        $product = $this->guestProductRepository->findActiveByShortLink($shortLink);

        return $product ? $this->mapProduct($product, limitSummaryAttributes: false) : null;
    }

    private function mapProduct(Product $product, bool $limitSummaryAttributes): GuestProductDto
    {
        $variants = $product->variants->map(function (ProductVariant $variant): GuestProductVariantDto {
            $attributes = $variant->options
                ->map(fn (ProductVariantOption $option): ?VariantAttributeDto => $this->mapVariantAttribute($option))
                ->filter()
                ->values()
                ->all();

            $colorAttribute = collect($attributes)
                ->first(static fn (VariantAttributeDto $attr): bool => $attr->isColor);

            return new GuestProductVariantDto(
                id: (int) $variant->id,
                price: (float) $variant->price,
                unit: $variant->unit,
                unitType: (string) $variant->unit_type,
                isDefault: (bool) $variant->is_default,
                color: $colorAttribute?->value,
                colorSwatch: $this->extractColorSwatch($variant, $colorAttribute),
                attributes: $attributes,
            );
        })->values()->all();

        $defaultVariant = collect($variants)->first(
            static fn (GuestProductVariantDto $variant): bool => $variant->isDefault,
        ) ?? ($variants[0] ?? null);

        $summaryAttributes = $this->buildSummaryAttributes($variants, $defaultVariant);

        return new GuestProductDto(
            id: (int) $product->id,
            title: $product->title,
            subtitle: $product->subtitle,
            description: $product->description,
            shortLink: $product->short_link,
            image: $this->resolveImage($product),
            introVideo: $this->resolveIntroVideo($product),
            gallery: $this->resolveGallery($product),
            defaultVariant: $defaultVariant,
            colors: $this->buildColors($variants),
            variants: $variants,
            summaryAttributes: $limitSummaryAttributes ? array_slice($summaryAttributes, 0, 2) : $summaryAttributes,
            categoryIds: $product->relationLoaded('categories')
                ? $product->categories->pluck('id')->map(fn ($id) => (int) $id)->all()
                : [],
        );
    }

    private function resolveImage(Product $product): ?string
    {
        $cover = $product->getFirstMediaUrl('cover_image');

        if ($cover !== '') {
            return $cover;
        }

        return $product->cover_image;
    }

    private function resolveIntroVideo(Product $product): ?string
    {
        $video = $product->getFirstMediaUrl('intro_video');

        return $video !== '' ? $video : $product->intro_video;
    }

    /** @return list<string> */
    private function resolveGallery(Product $product): array
    {
        $gallery = $product->getMedia('gallery')
            ->map(fn ($media): string => $media->getUrl())
            ->filter(fn (string $url): bool => $url !== '')
            ->values()
            ->all();

        if ($gallery !== []) {
            return $gallery;
        }

        return collect($product->gallery)
            ->filter(fn ($item): bool => is_string($item) && $item !== '')
            ->values()
            ->all();
    }

    private function extractColorSwatch(ProductVariant $variant, ?VariantAttributeDto $colorAttribute): ?string
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

        return $this->normalizeHexColor($colorAttribute->value);
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

    private function mapVariantAttribute(ProductVariantOption $option): ?VariantAttributeDto
    {
        $attribute = $option->attribute;
        $valueI18n = $this->decodeLocalizedValue((string) ($option->value?->value ?? ''));
        $value = $this->canonicalValueFromLocalized($valueI18n);

        if (! $attribute instanceof ProductAttribute || $value === '') {
            return null;
        }

        return new VariantAttributeDto(
            key: (string) $attribute->key,
            label: $attribute->label,
            value: $value,
            valueI18n: $valueI18n,
            isColor: $this->isColorAttribute($attribute),
            iconSvg: $attribute->icon_svg,
        );
    }

    /**
     * @param  list<GuestProductVariantDto> $variants
     * @return list<ProductColorDto>
     */
    private function buildColors(array $variants): array
    {
        /** @var array<string, ProductColorDto> $colorMap */
        $colorMap = [];

        foreach ($variants as $variant) {
            if ($variant->color === null || isset($colorMap[$variant->color])) {
                continue;
            }

            // The color attribute DTO is already on the variant — no need to re-search.
            $colorAttr = null;
            foreach ($variant->attributes as $attr) {
                if ($attr->isColor && $attr->value === $variant->color) {
                    $colorAttr = $attr;
                    break;
                }
            }

            $nameI18n = $colorAttr !== null
                ? ['fa' => $colorAttr->valueI18n['fa'], 'en' => $colorAttr->valueI18n['en']]
                : ['fa' => $variant->color, 'en' => $variant->color];

            $colorMap[$variant->color] = new ProductColorDto(
                name: $variant->color,
                nameI18n: $nameI18n,
                swatch: $variant->colorSwatch,
            );
        }

        return array_values($colorMap);
    }

    /**
     * @param  list<GuestProductVariantDto>  $variants
     * @return list<SummaryAttributeDto>
     */
    private function buildSummaryAttributes(array $variants, ?GuestProductVariantDto $defaultVariant): array
    {
        // Mutable accumulator — convert to DTOs at the end.
        $acc = [];

        foreach ($variants as $variant) {
            foreach ($variant->attributes as $attr) {
                if ($attr->isColor || $attr->key === '' || $attr->value === '') {
                    continue;
                }

                if (! isset($acc[$attr->key])) {
                    $acc[$attr->key] = [
                        'label'              => $attr->label,
                        'icon_svg'           => $attr->iconSvg,
                        'values'             => [],
                        'values_i18n'        => [],
                        'default_value'      => null,
                        'default_value_i18n' => null,
                    ];
                }

                if (! in_array($attr->value, $acc[$attr->key]['values'], true)) {
                    $acc[$attr->key]['values'][]      = $attr->value;
                    $acc[$attr->key]['values_i18n'][] = $attr->valueI18n;
                }
            }
        }

        if ($defaultVariant !== null) {
            foreach ($defaultVariant->attributes as $attr) {
                if ($attr->isColor || $attr->key === '' || $attr->value === '' || ! isset($acc[$attr->key])) {
                    continue;
                }

                $acc[$attr->key]['default_value']      = $attr->value;
                $acc[$attr->key]['default_value_i18n'] = $attr->valueI18n;
            }
        }

        $result = [];
        foreach ($acc as $key => $data) {
            $result[] = new SummaryAttributeDto(
                key:                $key,
                label:              $data['label'],
                iconSvg:            $data['icon_svg'],
                values:             $data['values'],
                valuesI18n:         $data['values_i18n'],
                defaultValue:       $data['default_value'],
                defaultValueI18n:   $data['default_value_i18n'],
            );
        }

        return $result;
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
