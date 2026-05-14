<?php

namespace App\Modules\Dashboard\Services;

use App\Models\User;
use App\Modules\Categories\Models\Category;
use App\Modules\Dashboard\DTOs\DashboardStatsDto;
use App\Modules\Dashboard\Services\Contracts\DashboardServiceInterface;
use App\Modules\Newsletter\Models\Subscriber;
use App\Modules\Products\Models\Product;
use App\Modules\Reviews\Models\Review;

class DashboardService implements DashboardServiceInterface
{
    public function getStats(): DashboardStatsDto
    {
        return new DashboardStatsDto(
            totalUsers:      User::withTrashed()->count(),
            activeUsers:     User::where('is_active', true)->count(),
            inactiveUsers:   User::where('is_active', false)->count(),
            deletedUsers:    User::onlyTrashed()->count(),
            totalProducts:   Product::withTrashed()->count(),
            activeProducts:  Product::where('is_active', true)->count(),
            inactiveProducts: Product::where('is_active', false)->count(),
            totalReviews:    Review::count(),
            totalCategories: Category::count(),
            totalSubscribers: Subscriber::count(),
        );
    }
}
