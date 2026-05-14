<?php

namespace App\Modules\Products\DTOs;

class GuestProductVariantDto
{
    /**
        * @param list<array{key: string, label: string, value: string, is_color: bool, icon_svg: string|null}> $attributes
     */
    public function __construct(
        public readonly int $id,
        public readonly float $price,
        public readonly ?string $sku,
        public readonly string $skuType,
        public readonly bool $isDefault,
        public readonly ?string $color,
        public readonly ?string $colorSwatch,
        public readonly array $attributes,
    ) {}

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'price' => $this->price,
            'sku' => $this->sku,
            'sku_type' => $this->skuType,
            'is_default' => $this->isDefault,
            'color' => $this->color,
            'color_swatch' => $this->colorSwatch,
            'attributes' => $this->attributes,
        ];
    }
}
