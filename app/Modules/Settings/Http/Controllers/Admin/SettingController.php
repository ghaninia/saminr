<?php

namespace App\Modules\Settings\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Settings\Http\Resources\SettingResource;
use App\Modules\Settings\Enums\SettingType;
use App\Modules\Settings\Models\Setting;
use App\Modules\Settings\Services\Contracts\SettingServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Validator;

class SettingController extends Controller
{
    public function __construct(private readonly SettingServiceInterface $settingService)
    {
    }

    public function index(): AnonymousResourceCollection
    {
        return SettingResource::collection($this->settingService->listAll());
    }

    public function update(Request $request, Setting $setting): SettingResource
    {
        $validator = Validator::make($request->all(), [
            'value' => ['present'],
        ], [
            'value.present' => 'The value field is required.',
        ]);

        $validator->after(function ($validator) use ($request, $setting): void {
            $value = $request->input('value');

            if ($value === null) {
                return;
            }

            if ($setting->type === SettingType::MULTIPLE) {
                if (! is_array($value)) {
                    $validator->errors()->add('value', 'The value must be an object with {fa,en} or an array of {fa,en}.');
                    return;
                }

                if (Arr::isAssoc($value)) {
                    $this->validateLocalizedObject($validator, 'value', $value);
                    return;
                }

                foreach ($value as $index => $row) {
                    if (! is_array($row) || ! Arr::isAssoc($row)) {
                        $validator->errors()->add("value.$index", 'Each item must be an object with {fa,en}.');
                        continue;
                    }
                    $this->validateLocalizedObject($validator, "value.$index", $row);
                }

                return;
            }

            if ($setting->type === SettingType::ARRAY) {
                if (! is_array($value)) {
                    $validator->errors()->add('value', 'The value must be an array.');
                }

                return;
            }

            if ($setting->type === SettingType::NUMBER) {
                if (! is_numeric($value)) {
                    $validator->errors()->add('value', 'The value must be a number.');
                }

                return;
            }

            if ($setting->type === SettingType::EMAIL) {
                if (! is_string($value) || filter_var($value, FILTER_VALIDATE_EMAIL) === false) {
                    $validator->errors()->add('value', 'The value must be a valid email address.');
                }

                return;
            }

            if ($setting->type === SettingType::WEBSITE) {
                if (! is_string($value) || filter_var($value, FILTER_VALIDATE_URL) === false) {
                    $validator->errors()->add('value', 'The value must be a valid URL.');
                }

                return;
            }

            if (is_array($value)) {
                $validator->errors()->add('value', 'The value must be a string.');
            }
        });

        $validated = $validator->validate();

        $updated = $this->settingService->updateValue($setting, $validated['value']);

        return new SettingResource($updated);
    }

    /**
     * @param array<string, mixed> $value
     */
    private function validateLocalizedObject(mixed $validator, string $path, array $value): void
    {
        if (! array_key_exists('fa', $value) || ! array_key_exists('en', $value)) {
            $validator->errors()->add($path, 'Both fa and en fields are required.');
            return;
        }

        if (! is_string($value['fa']) || ! is_string($value['en'])) {
            $validator->errors()->add($path, 'Both fa and en must be strings.');
        }
    }
}
