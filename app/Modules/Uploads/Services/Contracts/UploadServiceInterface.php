<?php

namespace App\Modules\Uploads\Services\Contracts;

use Illuminate\Http\UploadedFile;

interface UploadServiceInterface
{
    /**
     * @return array{url: string, setting: array{id: int, key: string, value: mixed, type: string|null}}
     */
    public function storeForSetting(int $settingId, UploadedFile $file): array;
}
