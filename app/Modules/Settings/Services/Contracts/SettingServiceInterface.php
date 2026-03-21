<?php

namespace App\Modules\Settings\Services\Contracts;

use App\Modules\Settings\Models\Setting;
use Illuminate\Database\Eloquent\Collection;

interface SettingServiceInterface
{
    /**
     * @return Collection<int, Setting>
     */
    public function listAll(): Collection;

    public function findByKey(string $key): ?Setting;

    public function getValue(string $key): mixed;

    public function getDefault(string $key): mixed;
}

