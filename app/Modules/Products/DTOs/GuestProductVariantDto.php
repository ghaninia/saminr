<?php

namespace App\Modules\Products\DTOs;

class GuestProductVariantDto
{
    /**
     * @param list<VariantAttributeDto> $attributes
     */
    public function __construct(
        public readonly int $id,
        public readonly float $price,
        public readonly ?string $unit,
        public readonly string $unitType,
        public readonly bool $isDefault,
        public readonly ?string $color,
        public readonly ?string $colorSwatch,
        public readonly array $attributes,
    ) {}
}
