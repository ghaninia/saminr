<?php

namespace App\Modules\Auth\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthUserResource extends JsonResource
{
    public static $wrap = 'user';

    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->resource->getKey(),
            'name'          => $this->resource->name,
            'email'         => $this->resource->email,
            'role'          => $this->resource->role?->value ?? null,
            'is_active'     => (bool) $this->resource->is_active,
            'phone'         => $this->resource->phone,
            'avatar'        => $this->resource->avatar,
            'last_login_at' => $this->resource->last_login_at,
        ];
    }
}
