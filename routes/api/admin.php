<?php

use App\Modules\Auth\Http\Controllers\Admin\AuthController;
use App\Modules\Auth\Http\Middleware\AdminJwtMiddleware;
use App\Modules\Settings\Http\Controllers\Admin\SettingController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me'])->middleware(AdminJwtMiddleware::class);
});

Route::middleware(AdminJwtMiddleware::class)->group(function (): void {
    Route::get('/settings', [SettingController::class, 'index']);
    Route::patch('/settings/{setting}', [SettingController::class, 'update']);
});
