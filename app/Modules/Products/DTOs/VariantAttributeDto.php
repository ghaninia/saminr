<?php

namespace App\Modules\Products\DTOs;

class VariantAttributeDto
{
    /**
     * @param array{fa: string, en: string}|string $label
     * @param array{fa: string, en: string}        $valueI18n
     */
    public function __construct(
        public readonly string $key,
        public readonly array|string $label,
        public readonly string $value,
        public readonly array $valueI18n,
        public readonly bool $isColor,
        public readonly ?string $iconSvg,
    ) {}
}
