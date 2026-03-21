<?php

namespace App\Providers;

use App\Modules\Auth\Services\Contracts\JwtServiceInterface;
use App\Modules\Auth\Services\JwtService;
use App\Modules\Settings\Repositories\Contracts\SettingRepositoryInterface;
use App\Modules\Settings\Repositories\EloquentSettingRepository;
use App\Modules\Settings\Services\Contracts\SettingServiceInterface;
use App\Modules\Settings\Services\SettingService;
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
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
