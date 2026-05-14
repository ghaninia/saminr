<?php

namespace App\Modules\Dashboard\Services;

use App\Models\User;
use App\Modules\Categories\Models\Category;
use App\Modules\Dashboard\Services\Contracts\DashboardServiceInterface;
use App\Modules\Newsletter\Models\Subscriber;
use App\Modules\Products\Models\Product;
use App\Modules\Reviews\Models\Review;

class DashboardService implements DashboardServiceInterface
{
    /** @return array<string, array<string, int>> */
    public function getStats(): array
    {
        return [
            'users' => [
                'total'    => User::withTrashed()->count(),
                'active'   => User::where('is_active', true)->count(),
                'inactive' => User::where('is_active', false)->count(),
                'deleted'  => User::onlyTrashed()->count(),
            ],
            'products' => [
                'total'    => Product::withTrashed()->count(),
                'active'   => Product::where('is_active', true)->count(),
                'inactive' => Product::where('is_active', false)->count(),
            ],
            'reviews' => [
                'total' => Review::count(),
            ],
            'categories' => [
                'total' => Category::count(),
            ],
            'subscribers' => [
                'total' => Subscriber::count(),
            ],
        ];
    }
}
