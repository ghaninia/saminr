<?php

namespace App\Modules\Dashboard\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Dashboard\Services\Contracts\DashboardServiceInterface;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardServiceInterface $dashboardService,
    ) {}

    public function stats(): JsonResponse
    {
        return response()->json([
            'data' => $this->dashboardService->getStats(),
        ]);
    }
}
