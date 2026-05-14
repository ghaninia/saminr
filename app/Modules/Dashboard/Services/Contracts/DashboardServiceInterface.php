<?php

namespace App\Modules\Dashboard\Services\Contracts;

interface DashboardServiceInterface
{
    /** @return array<string, array<string, int>> */
    public function getStats(): array;
}
