<?php

namespace App\Modules\Products\Http\Resources;

use App\Modules\Products\DTOs\GuestProductVariantDto;
use App\Modules\Products\DTOs\VariantAttributeDto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GuestProductVariantResource extends JsonResource
{
    /** @param GuestProductVariantDto $resource */
    public function toArray(Request $request): array
    {
        /** @var GuestProductVariantDto $dto */
        $dto = $this->resource;

        return [
            'id'          => $dto->id,
            'price'       => $dto->price,
            'unit'        => $dto->unit,
            'unit_type'   => $dto->unitType,
            'is_default'  => $dto->isDefault,
            'color'       => $dto->color,
            'color_swatch' => $dto->colorSwatch,
            'attributes'  => array_map(
                static fn (VariantAttributeDto $attr): array => [
                    'key'        => $attr->key,
                    'label'      => $attr->label,
                    'value'      => $attr->value,
                    'value_i18n' => $attr->valueI18n,
                    'is_color'   => $attr->isColor,
                    'icon_svg'   => $attr->iconSvg,
                ],
                $dto->attributes,
            ),
        ];
    }
}
