<?php

use Illuminate\Support\Facades\Route;

Route::prefix('client')->group(base_path('routes/api/client.php'));
Route::prefix('admin')->group(base_path('routes/api/admin.php'));
