<?php

namespace App\Modules\Settings\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Settings\Http\Resources\SettingResource;
use App\Modules\Settings\Services\Contracts\SettingServiceInterface;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SettingController extends Controller
{
    public function __construct(private readonly SettingServiceInterface $settingService)
    {
    }

    public function index(): AnonymousResourceCollection
    {
        return SettingResource::collection($this->settingService->listAll());
    }
}
