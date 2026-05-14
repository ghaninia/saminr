<?php

namespace App\Modules\Products\DTOs;

class ProductColorDto
{
    /**
     * @param array{fa: string, en: string} $nameI18n
     */
    public function __construct(
        public readonly string $name,
        public readonly array $nameI18n,
        public readonly ?string $swatch,
    ) {}
}
