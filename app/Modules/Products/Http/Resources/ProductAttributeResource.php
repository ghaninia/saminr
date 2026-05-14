<?php

namespace App\Modules\Products\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductAttributeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'key'        => $this->key,
            'label'      => $this->label,
            'icon_svg'   => $this->icon_svg,
            'value_type' => $this->value_type,
            'sort_order' => $this->sort_order,
            'values'     => $this->values->map(function ($value): array {
                $valueI18n = $this->decodeLocalizedValue((string) $value->value);

                return [
                    'id'         => $value->id,
                    'value'      => $this->canonicalValueFromLocalized($valueI18n),
                    'value_i18n' => $valueI18n,
                    'meta'       => $value->meta,
                    'sort_order' => $value->sort_order,
                ];
            })->values(),
        ];
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
