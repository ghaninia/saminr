<?php

namespace App\Modules\Uploads\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Settings\Enums\SettingType;
use App\Modules\Settings\Models\Setting;
use App\Modules\Settings\Services\Contracts\SettingServiceInterface;
use App\Modules\Uploads\Http\Requests\Admin\UploadStoreRequest;
use Illuminate\Http\JsonResponse;

class UploadController extends Controller
{
    public function __construct(private readonly SettingServiceInterface $settingService)
    {
    }

    public function store(UploadStoreRequest $request): JsonResponse
    {
        $validated = $request->validated();

        /** @var Setting $setting */
        $setting = Setting::query()->findOrFail($validated['setting_id']);

        if (! in_array($setting->type, [SettingType::FILE, SettingType::LINK, SettingType::IMAGE], true)) {
            return response()->json([
                'message' => __('responses.uploads.setting_no_uploads'),
            ], 422);
        }

        $media = $setting
            ->addMediaFromRequest('file')
            ->toMediaCollection($setting->key);

        $url = $media->getUrl();

        $this->settingService->updateValue($setting, $url);

        return response()->json([
            'url' => $url,
            'setting' => [
                'id' => $setting->id,
                'key' => $setting->key,
                'value' => $setting->fresh()->value,
                'type' => $setting->type?->value,
            ],
        ]);
    }
}
