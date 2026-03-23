<?php

namespace App\Modules\Settings\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Settings\Http\Requests\Admin\SettingUpdateRequest;
use App\Modules\Settings\Http\Resources\SettingResource;
use App\Modules\Settings\Models\Setting;
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

    public function update(SettingUpdateRequest $request, Setting $setting): SettingResource
    {
        $validated = $request->validated();

        $updated = $this->settingService->updateValue($setting, $validated['value']);

        return new SettingResource($updated);
    }
}
