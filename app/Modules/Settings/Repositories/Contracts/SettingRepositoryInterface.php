<?php

namespace App\Modules\Settings\Repositories\Contracts;

use App\Modules\Settings\Models\Setting;
use Illuminate\Database\Eloquent\Collection;

interface SettingRepositoryInterface
{
    /**
     * @return Collection<int, Setting>
     */
    public function listAll(): Collection;

    public function findByKey(string $key): ?Setting;
}
