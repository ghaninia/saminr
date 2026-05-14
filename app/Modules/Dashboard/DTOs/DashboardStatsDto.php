<?php

namespace App\Modules\Dashboard\DTOs;

class DashboardStatsDto
{
    public function __construct(
        public readonly int $totalUsers,
        public readonly int $activeUsers,
        public readonly int $inactiveUsers,
        public readonly int $deletedUsers,
        public readonly int $totalProducts,
        public readonly int $activeProducts,
        public readonly int $inactiveProducts,
        public readonly int $totalReviews,
        public readonly int $totalCategories,
        public readonly int $totalSubscribers,
    ) {}
}
