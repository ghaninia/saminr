<?php

use App\Modules\Settings\Http\Controllers\Admin\SettingController;
use Illuminate\Support\Facades\Route;

Route::get('/settings', [SettingController::class, 'index']);
