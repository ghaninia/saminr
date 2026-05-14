<?php

namespace App\Modules\Uploads\DTOs;

class UploadResultDto
{
    public function __construct(
        public readonly string $url,
        public readonly int $settingId,
        public readonly string $settingKey,
        public readonly mixed $settingValue,
        public readonly ?string $settingType,
    ) {}
}
