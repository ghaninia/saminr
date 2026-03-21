<?php

namespace App\Modules\Settings\Services;

use App\Modules\Settings\Enums\SettingType;
use App\Modules\Settings\Models\Setting;
use App\Modules\Settings\Repositories\Contracts\SettingRepositoryInterface;
use App\Modules\Settings\Services\Contracts\SettingServiceInterface;
use Illuminate\Database\Eloquent\Collection;

class SettingService implements SettingServiceInterface
{
    public function __construct(private readonly SettingRepositoryInterface $settingRepository)
    {
    }

    /**
     * @return Collection<int, Setting>
     */
    public function listAll(): Collection
    {
        return $this->settingRepository->listAll();
    }

    public function findByKey(string $key): ?Setting
    {
        return $this->settingRepository->findByKey($key);
    }

    /**
     * Returns the resolved value for a setting:
     * falls back to default when value is null,
     * and auto-decodes JSON for MULTIPLE type.
     */
    public function getValue(string $key): mixed
    {
        $setting = $this->settingRepository->findByKey($key);

        if ($setting === null) {
            return null;
        }

        $raw = $setting->value ?? $setting->default;

        return $setting->type === SettingType::MULTIPLE
            ? $this->decodeJson($raw)
            : $raw;
    }

    /**
     * Returns the decoded default value for a setting.
     */
    public function getDefault(string $key): mixed
    {
        $setting = $this->settingRepository->findByKey($key);

        if ($setting === null) {
            return null;
        }

        return $setting->type === SettingType::MULTIPLE
            ? $this->decodeJson($setting->default)
            : $setting->default;
    }

    private function decodeJson(?string $value): mixed
    {
        if ($value === null) {
            return null;
        }

        $decoded = json_decode($value, true);

        return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
    }
}
