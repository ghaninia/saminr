<?php

use App\Modules\Categories\Http\Controllers\Client\CategoryController;
use App\Modules\Newsletter\Http\Controllers\Client\SubscriberController as ClientSubscriberController;
use App\Modules\Reviews\Http\Controllers\Client\ReviewController;
use App\Modules\Settings\Http\Controllers\Client\SettingController;
use Illuminate\Support\Facades\Route;

Route::get('/settings', [SettingController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/reviews', [ReviewController::class, 'index']);
Route::post('/subscribe', [ClientSubscriberController::class, 'store'])->middleware('throttle:subscribe');
