<?php

use App\Modules\Auth\Http\Controllers\Admin\AuthController;
use App\Modules\Auth\Http\Middleware\AdminJwtMiddleware;
use App\Modules\Categories\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Modules\Newsletter\Http\Controllers\Admin\NewsletterController as AdminNewsletterController;
use App\Modules\Newsletter\Http\Controllers\Admin\SubscriberController as AdminSubscriberController;
use App\Modules\Reviews\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Modules\Settings\Http\Controllers\Admin\SettingController;
use App\Modules\Uploads\Http\Controllers\Admin\UploadController;
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
    Route::post('/uploads', [UploadController::class, 'store']);

    Route::get('/categories', [AdminCategoryController::class, 'index']);
    Route::post('/categories', [AdminCategoryController::class, 'store']);
    Route::patch('/categories/{category}', [AdminCategoryController::class, 'update']);
    Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy']);
    Route::post('/categories/{category}/upload', [AdminCategoryController::class, 'upload']);

    Route::get('/subscribers', [AdminSubscriberController::class, 'index']);
    Route::delete('/subscribers/{subscriber}', [AdminSubscriberController::class, 'destroy']);

    Route::get('/newsletters', [AdminNewsletterController::class, 'index']);
    Route::post('/newsletters', [AdminNewsletterController::class, 'store']);
    Route::post('/newsletters/{newsletter}/send', [AdminNewsletterController::class, 'send']);

    Route::get('/reviews', [AdminReviewController::class, 'index']);
    Route::post('/reviews', [AdminReviewController::class, 'store']);
    Route::patch('/reviews/{review}', [AdminReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [AdminReviewController::class, 'destroy']);
    Route::post('/reviews/{review}/upload', [AdminReviewController::class, 'upload']);
});
