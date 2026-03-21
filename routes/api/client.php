<?php

use App\Modules\Categories\Http\Controllers\Client\CategoryController;
use App\Modules\Settings\Http\Controllers\Client\SettingController;
use Illuminate\Support\Facades\Route;

Route::get('/settings', [SettingController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);
