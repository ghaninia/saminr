<?php

namespace App\Modules\Uploads\Services\Contracts;

use App\Modules\Uploads\DTOs\UploadResultDto;
use Illuminate\Http\UploadedFile;

interface UploadServiceInterface
{
    public function storeForSetting(int $settingId, UploadedFile $file): UploadResultDto;
}
