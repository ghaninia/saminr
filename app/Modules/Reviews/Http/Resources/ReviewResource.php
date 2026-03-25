<?php

namespace App\Modules\Reviews\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Reviews\Models\Review */
class ReviewResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'fullname'   => $this->fullname,
            'review'     => $this->review,
            'star'       => $this->star,
            'avatar'     => $this->avatar,
            'user_type'  => $this->user_type,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
