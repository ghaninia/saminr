<?php

namespace App\Modules\Products\DTOs;

class GuestProductDto
{
    /**
     * @param list<array{name: string, swatch: string|null}> $colors
     * @param list<GuestProductVariantDto> $variants
        * @param list<array{key: string, label: string, icon_svg: string|null, values: list<string>, default_value: string|null}> $summaryAttributes
     */
    public function __construct(
        public readonly int $id,
        public readonly array|string|null $title,
        public readonly array|string|null $subtitle,
        public readonly array|string|null $description,
        public readonly ?string $shortLink,
        public readonly ?string $image,
        public readonly ?GuestProductVariantDto $defaultVariant,
        public readonly array $colors,
        public readonly array $variants,
        public readonly array $summaryAttributes,
    ) {}

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'description' => $this->description,
            'short_link' => $this->shortLink,
            'image' => $this->image,
            'default_variant' => $this->defaultVariant?->toArray(),
            'colors' => $this->colors,
            'variants' => array_map(
                static fn (GuestProductVariantDto $variant): array => $variant->toArray(),
                $this->variants,
            ),
            'summary_attributes' => $this->summaryAttributes,
        ];
    }
}
