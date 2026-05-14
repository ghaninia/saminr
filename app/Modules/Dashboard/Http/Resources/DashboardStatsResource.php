<?php

namespace App\Modules\Dashboard\Http\Resources;

use App\Modules\Dashboard\DTOs\DashboardStatsDto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardStatsResource extends JsonResource
{
    /** @param DashboardStatsDto $resource */
    public function toArray(Request $request): array
    {
        /** @var DashboardStatsDto $dto */
        $dto = $this->resource;

        return [
            'users' => [
                'total'    => $dto->totalUsers,
                'active'   => $dto->activeUsers,
                'inactive' => $dto->inactiveUsers,
                'deleted'  => $dto->deletedUsers,
            ],
            'products' => [
                'total'    => $dto->totalProducts,
                'active'   => $dto->activeProducts,
                'inactive' => $dto->inactiveProducts,
            ],
            'reviews' => [
                'total' => $dto->totalReviews,
            ],
            'categories' => [
                'total' => $dto->totalCategories,
            ],
            'subscribers' => [
                'total' => $dto->totalSubscribers,
            ],
        ];
    }
}
