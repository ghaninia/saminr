<?php

namespace App\Modules\Uploads\Http\Resources;

use App\Modules\Uploads\DTOs\UploadResultDto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UploadResultResource extends JsonResource
{
    /** @param UploadResultDto $resource */
    public function toArray(Request $request): array
    {
        /** @var UploadResultDto $dto */
        $dto = $this->resource;

        return [
            'url'     => $dto->url,
            'setting' => [
                'id'    => $dto->settingId,
                'key'   => $dto->settingKey,
                'value' => $dto->settingValue,
                'type'  => $dto->settingType,
            ],
        ];
    }
}
