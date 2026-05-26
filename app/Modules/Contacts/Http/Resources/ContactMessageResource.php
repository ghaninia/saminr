<?php

namespace App\Modules\Contacts\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactMessageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->resource->getKey(),
            'fullname'    => (string) ($this->resource->fullname ?? ''),
            'email'       => (string) ($this->resource->email ?? ''),
            'content'     => (string) ($this->resource->content ?? ''),
            'is_read'     => (bool) ($this->resource->is_read ?? false),
            'is_answered' => (bool) ($this->resource->is_answered ?? false),
            'created_at'  => $this->resource->created_at?->toISOString(),
        ];
    }
}
