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
            'value_type' => $this->value_type,
            'sort_order' => $this->sort_order,
            'values'     => $this->values->map(fn ($value): array => [
                'id'         => $value->id,
                'value'      => $value->value,
                'meta'       => $value->meta,
                'sort_order' => $value->sort_order,
            ])->values(),
        ];
    }
}
