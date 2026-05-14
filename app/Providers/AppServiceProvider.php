<?php

namespace App\Providers;

use App\Modules\Auth\Services\Contracts\JwtServiceInterface;
use App\Modules\Auth\Services\JwtService;
use App\Modules\Categories\Repositories\Contracts\CategoryRepositoryInterface;
use App\Modules\Categories\Repositories\EloquentCategoryRepository;
use App\Modules\Categories\Services\Contracts\CategoryServiceInterface;
use App\Modules\Categories\Services\CategoryService;
use App\Modules\Dashboard\Services\Contracts\DashboardServiceInterface;
use App\Modules\Dashboard\Services\DashboardService;
use App\Modules\Newsletter\Services\Contracts\NewsletterServiceInterface;
use App\Modules\Newsletter\Services\Contracts\SubscriberServiceInterface;
use App\Modules\Newsletter\Services\NewsletterService;
use App\Modules\Newsletter\Services\SubscriberService;
use App\Modules\Products\Repositories\Contracts\ProductRepositoryInterface;
use App\Modules\Products\Repositories\EloquentProductRepository;
use App\Modules\Products\Services\Contracts\ProductServiceInterface;
use App\Modules\Products\Services\ProductService;
use App\Modules\Reviews\Repositories\Contracts\ReviewRepositoryInterface;
use App\Modules\Reviews\Repositories\EloquentReviewRepository;
use App\Modules\Reviews\Services\Contracts\ReviewServiceInterface;
use App\Modules\Reviews\Services\ReviewService;
use App\Modules\Settings\Repositories\Contracts\SettingRepositoryInterface;
use App\Modules\Settings\Repositories\EloquentSettingRepository;
use App\Modules\Settings\Services\Contracts\SettingServiceInterface;
use App\Modules\Settings\Services\SettingService;
use App\Modules\Uploads\Services\Contracts\UploadServiceInterface;
use App\Modules\Uploads\Services\UploadService;
use App\Modules\Users\Repositories\Contracts\UserRepositoryInterface;
use App\Modules\Users\Repositories\EloquentUserRepository;
use App\Modules\Users\Services\Contracts\UserServiceInterface;
use App\Modules\Users\Services\UserService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(SettingRepositoryInterface::class, EloquentSettingRepository::class);
        $this->app->bind(SettingServiceInterface::class, SettingService::class);
        $this->app->bind(JwtServiceInterface::class, JwtService::class);
        $this->app->bind(CategoryRepositoryInterface::class, EloquentCategoryRepository::class);
        $this->app->bind(CategoryServiceInterface::class, CategoryService::class);
        $this->app->bind(DashboardServiceInterface::class, DashboardService::class);
        $this->app->bind(UploadServiceInterface::class, UploadService::class);
        $this->app->bind(SubscriberServiceInterface::class, SubscriberService::class);
        $this->app->bind(NewsletterServiceInterface::class, NewsletterService::class);
        $this->app->bind(ReviewRepositoryInterface::class, EloquentReviewRepository::class);
        $this->app->bind(ReviewServiceInterface::class, ReviewService::class);
        $this->app->bind(ProductRepositoryInterface::class, EloquentProductRepository::class);
        $this->app->bind(ProductServiceInterface::class, ProductService::class);
        $this->app->bind(UserRepositoryInterface::class, EloquentUserRepository::class);
        $this->app->bind(UserServiceInterface::class, UserService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('subscribe', function (Request $request): array {
            $ip = (string) ($request->ip() ?: 'unknown');
            $email = strtolower(trim((string) $request->input('email', '')));

            $limits = [
                // IP-based to reduce bot/spam requests.
                Limit::perMinute(5)->by("subscribe:ip:{$ip}"),
            ];

            // Email-based to avoid blasting different payloads for one address.
            if ($email !== '') {
                $limits[] = Limit::perHour(20)->by("subscribe:email:{$email}");
            }

            return $limits;
        });
    }
}
