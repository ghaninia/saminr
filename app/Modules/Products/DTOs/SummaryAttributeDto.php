<?php

namespace App\Modules\Products\DTOs;

class SummaryAttributeDto
{
    /**
     * @param array{fa: string, en: string}|string         $label
     * @param list<string>                                  $values
     * @param list<array{fa: string, en: string}>           $valuesI18n
     * @param array{fa: string, en: string}|null           $defaultValueI18n
     */
    public function __construct(
        public readonly string $key,
        public readonly array|string $label,
        public readonly ?string $iconSvg,
        public readonly array $values,
        public readonly array $valuesI18n,
        public readonly ?string $defaultValue,
        public readonly ?array $defaultValueI18n,
    ) {}
}
