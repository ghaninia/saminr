<?php

namespace App\Modules\Products\DTOs;

class GuestProductDto
{
    /**
     * @param list<GuestProductVariantDto> $variants
     * @param list<ProductColorDto>        $colors
     * @param list<SummaryAttributeDto>    $summaryAttributes
     * @param list<string>                 $gallery
     * @param list<int>                    $categoryIds
     */
    public function __construct(
        public readonly int $id,
        public readonly array|string|null $title,
        public readonly array|string|null $subtitle,
        public readonly array|string|null $description,
        public readonly ?string $shortLink,
        public readonly ?string $image,
        public readonly ?string $introVideo,
        public readonly array $gallery,
        public readonly ?GuestProductVariantDto $defaultVariant,
        public readonly array $colors,
        public readonly array $variants,
        public readonly array $summaryAttributes,
        public readonly array $categoryIds = [],
    ) {}
}
