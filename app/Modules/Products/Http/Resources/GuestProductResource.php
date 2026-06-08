<?php

namespace App\Modules\Products\Http\Resources;

use App\Modules\Products\DTOs\GuestProductDto;
use App\Modules\Products\DTOs\ProductColorDto;
use App\Modules\Products\DTOs\SummaryAttributeDto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GuestProductResource extends JsonResource
{
    /** @param GuestProductDto $resource */
    public function toArray(Request $request): array
    {
        /** @var GuestProductDto $dto */
        $dto = $this->resource;

        return [
            'id'                 => $dto->id,
            'title'              => $dto->title,
            'subtitle'           => $dto->subtitle,
            'description'        => $dto->description,
            'short_link'         => $dto->shortLink,
            'image'              => $dto->image,
            'intro_video'        => $dto->introVideo,
            'gallery'            => $dto->gallery,
            'default_variant'    => $dto->defaultVariant
                ? new GuestProductVariantResource($dto->defaultVariant)
                : null,
            'colors'             => array_map(
                static fn (ProductColorDto $color): array => [
                    'name'      => $color->name,
                    'name_i18n' => $color->nameI18n,
                    'swatch'    => $color->swatch,
                ],
                $dto->colors,
            ),
            'variants'           => GuestProductVariantResource::collection($dto->variants),
            'summary_attributes' => array_map(
                static fn (SummaryAttributeDto $attr): array => [
                    'key'                => $attr->key,
                    'label'              => $attr->label,
                    'icon_svg'           => $attr->iconSvg,
                    'values'             => $attr->values,
                    'values_i18n'        => $attr->valuesI18n,
                    'default_value'      => $attr->defaultValue,
                    'default_value_i18n' => $attr->defaultValueI18n,
                ],
                $dto->summaryAttributes,
            ),
            'category_ids'       => $dto->categoryIds,
        ];
    }
}
