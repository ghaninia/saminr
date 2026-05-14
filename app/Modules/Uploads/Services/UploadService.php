<?php

namespace App\Modules\Uploads\Services;

use App\Modules\Settings\Enums\SettingType;
use App\Modules\Settings\Repositories\Contracts\SettingRepositoryInterface;
use App\Modules\Settings\Services\Contracts\SettingServiceInterface;
use App\Modules\Uploads\Exceptions\SettingUploadNotAllowedException;
use App\Modules\Uploads\Services\Contracts\UploadServiceInterface;
use Illuminate\Http\UploadedFile;

class UploadService implements UploadServiceInterface
{
    public function __construct(
        private readonly SettingRepositoryInterface $settingRepository,
        private readonly SettingServiceInterface $settingService,
    ) {}

    /** @return array{url: string, setting: array{id: int, key: string, value: mixed, type: string|null}} */
    public function storeForSetting(int $settingId, UploadedFile $file): array
    {
        $setting = $this->settingRepository->findById($settingId);

        if (! in_array($setting->type, [SettingType::FILE, SettingType::LINK, SettingType::IMAGE], true)) {
            throw new SettingUploadNotAllowedException();
        }

        $media = $setting
            ->addMedia($file)
            ->toMediaCollection($setting->key);

        $url = $media->getUrl();

        $this->settingService->updateValue($setting, $url);

        return [
            'url'     => $url,
            'setting' => [
                'id'    => (int) $setting->getKey(),
                'key'   => $setting->key,
                'value' => $setting->fresh()?->value,
                'type'  => $setting->type?->value,
            ],
        ];
    }
}
