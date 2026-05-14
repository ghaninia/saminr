<?php

namespace App\Modules\Settings\Repositories;

use App\Modules\Settings\Models\Setting;
use App\Modules\Settings\Repositories\Contracts\SettingRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class EloquentSettingRepository implements SettingRepositoryInterface
{
    /**
     * @return Collection<int, Setting>
     */
    public function listAll(): Collection
    {
        return Setting::query()
            ->orderBy('key')
            ->get();
    }

    public function findByKey(string $key): ?Setting
    {
        return Setting::query()
            ->where('key', $key)
            ->first();
    }

    public function findById(int $id): Setting
    {
        /** @var Setting $setting */
        $setting = Setting::query()->findOrFail($id);

        return $setting;
    }

    public function save(Setting $setting): Setting
    {
        $setting->save();

        return $setting;
    }
}
