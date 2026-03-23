<?php

namespace App\Modules\Newsletter\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriberResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->getKey(),
            'fullname' => (string) ($this->resource->fullname ?? ''),
            'email' => (string) ($this->resource->email ?? ''),
            'created_at' => $this->resource->created_at?->toISOString(),
        ];
    }
}

