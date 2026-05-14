<?php

use App\Modules\Auth\Http\Controllers\Admin\AuthController;
use App\Modules\Auth\Http\Middleware\AdminJwtMiddleware;
use App\Modules\Categories\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Modules\Dashboard\Http\Controllers\Admin\DashboardController;
use App\Modules\Newsletter\Http\Controllers\Admin\NewsletterController as AdminNewsletterController;
use App\Modules\Newsletter\Http\Controllers\Admin\SubscriberController as AdminSubscriberController;
use App\Modules\Products\Http\Controllers\Admin\ProductAttributeController as AdminProductAttributeController;
use App\Modules\Products\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Modules\Reviews\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Modules\Settings\Http\Controllers\Admin\SettingController;
use App\Modules\Uploads\Http\Controllers\Admin\UploadController;
use App\Modules\Users\Http\Controllers\Admin\UserController as AdminUserController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me'])->middleware(AdminJwtMiddleware::class);
});

Route::middleware(AdminJwtMiddleware::class)->group(function (): void {
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

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

    Route::get('/users', [AdminUserController::class, 'index']);
    Route::post('/users', [AdminUserController::class, 'store']);
    Route::patch('/users/{user}', [AdminUserController::class, 'update']);
    Route::patch('/users/{user}/status', [AdminUserController::class, 'setStatus']);
    Route::post('/users/{user}/upload', [AdminUserController::class, 'upload']);
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);

    Route::get('/reviews', [AdminReviewController::class, 'index']);
    Route::post('/reviews', [AdminReviewController::class, 'store']);
    Route::patch('/reviews/{review}', [AdminReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [AdminReviewController::class, 'destroy']);
    Route::post('/reviews/{review}/upload', [AdminReviewController::class, 'upload']);

    Route::get('/products', [AdminProductController::class, 'index']);
    Route::get('/products/{product}', [AdminProductController::class, 'show']);
    Route::post('/products', [AdminProductController::class, 'store']);
    Route::patch('/products/{product}', [AdminProductController::class, 'update']);
    Route::patch('/products/{product}/status', [AdminProductController::class, 'setStatus']);
    Route::delete('/products/{product}', [AdminProductController::class, 'destroy']);
    Route::post('/products/{product}/upload', [AdminProductController::class, 'upload']);
    Route::delete('/products/{product}/media', [AdminProductController::class, 'deleteMedia']);
    Route::get('/product-attributes', [AdminProductAttributeController::class, 'index']);
});
