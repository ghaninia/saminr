<?php

namespace App\Modules\Uploads\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UploadStoreRequest extends FormRequest
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
            'file' => ['required', 'file', 'max:4096', 'mimes:png,jpg,jpeg,webp,svg,ico'],
            'setting_id' => ['required', 'integer', 'exists:settings,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.required' => __('validation_messages.file.required'),
            'file.mimes' => __('validation_messages.file.mimes'),
            'file.max' => __('validation_messages.file.max'),
            'setting_id.required' => __('validation_messages.setting_id.required'),
        ];
    }
}

