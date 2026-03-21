<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class);

Route::get('/admin/{any?}', DashboardController::class)->where('any', '.*');

Route::fallback(HomeController::class);
