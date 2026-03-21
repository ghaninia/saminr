<?php

namespace App\Providers;

use App\Modules\Settings\Repositories\Contracts\SettingRepositoryInterface;
use App\Modules\Settings\Repositories\EloquentSettingRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(SettingRepositoryInterface::class, EloquentSettingRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
