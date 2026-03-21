<?php

use App\Modules\Settings\Http\Controllers\Client\SettingController;
use Illuminate\Support\Facades\Route;

Route::get('/settings', [SettingController::class, 'index']);
