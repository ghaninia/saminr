<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class);

Route::get('/admin/{any?}', DashboardController::class)->where('any', '.*');

// Keep client-side pages working, but never swallow API routes.
Route::get('/{any}', HomeController::class)->where('any', '^(?!api(?:/|$)).*');
