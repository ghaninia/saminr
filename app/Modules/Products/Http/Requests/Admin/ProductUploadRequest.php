<?php

namespace App\Modules\Products\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductUploadRequest extends FormRequest
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
            'file' => ['required', 'file', 'max:20480', 'mimes:png,jpg,jpeg,webp,svg,ico,mp4,mov,webm,m4v'],
            'field' => ['sometimes', 'string', Rule::in(['cover_image', 'gallery', 'intro_video'])],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.required' => __('validation_messages.file.required'),
            'file.max' => __('validation_messages.file.max'),
            'field.in' => __('validation_messages.field.in'),
        ];
    }
}
