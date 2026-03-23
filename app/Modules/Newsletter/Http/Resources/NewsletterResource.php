<?php

namespace App\Modules\Newsletter\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NewsletterResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->getKey(),
            'subject' => (string) ($this->resource->subject ?? ''),
            'html' => (string) ($this->resource->html ?? ''),
            'status' => (string) ($this->resource->status ?? 'draft'),
            'queued_at' => $this->resource->queued_at?->toISOString(),
            'sent_at' => $this->resource->sent_at?->toISOString(),
            'sent_count' => (int) ($this->resource->sent_count ?? 0),
            'last_error' => $this->resource->last_error ? (string) $this->resource->last_error : null,
            'created_at' => $this->resource->created_at?->toISOString(),
        ];
    }
}

