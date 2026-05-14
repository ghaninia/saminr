<?php

namespace App\Modules\Products\DTOs;

class GuestProductDto
{
    /**
     * @param list<GuestProductVariantDto> $variants
     * @param list<ProductColorDto>        $colors
     * @param list<SummaryAttributeDto>    $summaryAttributes
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
}
