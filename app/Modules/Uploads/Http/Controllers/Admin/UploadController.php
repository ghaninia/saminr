<?php

namespace App\Modules\Uploads\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Settings\Enums\SettingType;
use App\Modules\Settings\Models\Setting;
use App\Modules\Settings\Services\Contracts\SettingServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function __construct(private readonly SettingServiceInterface $settingService)
    {
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'max:4096', 'mimes:png,jpg,jpeg,webp,svg,ico'],
            'setting_id' => ['required', 'integer', 'exists:settings,id'],
        ], [
            'file.required' => 'A file is required.',
            'file.mimes' => 'Only png, jpg, jpeg, webp, svg, and ico files are allowed.',
            'file.max' => 'Maximum file size is 4MB.',
            'setting_id.required' => 'A setting_id is required.',
        ]);

        /** @var Setting $setting */
        $setting = Setting::query()->findOrFail($validated['setting_id']);

        if (! in_array($setting->type, [SettingType::FILE, SettingType::LINK, SettingType::IMAGE], true)) {
            return response()->json([
                'message' => 'This setting does not support file uploads.',
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
