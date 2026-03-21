<?php

namespace App\Modules\Settings\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Settings\Models\Setting */
class SettingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'      => $this->id,
            'key'     => $this->key,
            'value'   => $this->value,
            'default' => $this->resolved_default,
            'type'    => $this->type?->value,
        ];
    }
}
