<?php

namespace App\Providers;

use App\Modules\Auth\Services\Contracts\JwtServiceInterface;
use App\Modules\Auth\Services\JwtService;
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
        $this->app->bind(SubscriberServiceInterface::class, SubscriberService::class);
        $this->app->bind(NewsletterServiceInterface::class, NewsletterService::class);
        $this->app->bind(ReviewRepositoryInterface::class, EloquentReviewRepository::class);
        $this->app->bind(ReviewServiceInterface::class, ReviewService::class);
        $this->app->bind(ProductRepositoryInterface::class, EloquentProductRepository::class);
        $this->app->bind(ProductServiceInterface::class, ProductService::class);
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
