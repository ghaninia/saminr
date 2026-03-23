<?php

namespace App\Modules\Categories\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryUploadRequest extends FormRequest
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
            'field' => ['sometimes', 'string', Rule::in(['image', 'icon'])],
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
            'field.in' => __('validation_messages.field.in'),
        ];
    }
}

