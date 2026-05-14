<?php

namespace App\Modules\Dashboard\Services\Contracts;

use App\Modules\Dashboard\DTOs\DashboardStatsDto;

interface DashboardServiceInterface
{
    public function getStats(): DashboardStatsDto;
}
