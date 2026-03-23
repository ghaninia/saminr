<?php

namespace App\Modules\Settings\Http\Requests\Admin;

use App\Modules\Settings\Enums\SettingType;
use App\Modules\Settings\Models\Setting;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Validation\Validator;

class SettingUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'value' => ['present'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'value.present' => __('validation_messages.value.present'),
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $setting = $this->route('setting');
            if (! $setting instanceof Setting) {
                return;
            }

            $value = $this->input('value');
            if ($value === null) {
                return;
            }

            if ($setting->type === SettingType::MULTIPLE) {
                if (! is_array($value)) {
                    $validator->errors()->add('value', __('validation_messages.value.object_or_array'));
                    return;
                }

                if (Arr::isAssoc($value)) {
                    $this->validateLocalizedObject($validator, 'value', $value);
                    return;
                }

                foreach ($value as $index => $row) {
                    if (! is_array($row) || ! Arr::isAssoc($row)) {
                        $validator->errors()->add("value.$index", __('validation_messages.value.each_item_object'));
                        continue;
                    }
                    $this->validateLocalizedObject($validator, "value.$index", $row);
                }

                return;
            }

            if ($setting->type === SettingType::ARRAY) {
                if (! is_array($value)) {
                    $validator->errors()->add('value', __('validation_messages.value.array'));
                }

                return;
            }

            if ($setting->type === SettingType::NUMBER) {
                if (! is_numeric($value)) {
                    $validator->errors()->add('value', __('validation_messages.value.number'));
                }

                return;
            }

            if ($setting->type === SettingType::EMAIL) {
                if (! is_string($value) || filter_var($value, FILTER_VALIDATE_EMAIL) === false) {
                    $validator->errors()->add('value', __('validation_messages.value.email'));
                }

                return;
            }

            if ($setting->type === SettingType::WEBSITE) {
                if (! is_string($value) || filter_var($value, FILTER_VALIDATE_URL) === false) {
                    $validator->errors()->add('value', __('validation_messages.value.url'));
                }

                return;
            }

            if (is_array($value)) {
                $validator->errors()->add('value', __('validation_messages.value.string'));
            }
        });
    }

    /**
     * @param array<string, mixed> $value
     */
    private function validateLocalizedObject(Validator $validator, string $path, array $value): void
    {
        if (! array_key_exists('fa', $value) || ! array_key_exists('en', $value)) {
            $validator->errors()->add($path, __('validation_messages.localized_object.keys'));
            return;
        }

        if (! is_string($value['fa']) || ! is_string($value['en'])) {
            $validator->errors()->add($path, __('validation_messages.localized_object.strings'));
        }
    }
}

