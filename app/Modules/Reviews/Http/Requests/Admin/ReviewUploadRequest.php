<?php

namespace App\Modules\Reviews\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ReviewUploadRequest extends FormRequest
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
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.required' => __('validation_messages.file.required'),
            'file.mimes'    => __('validation_messages.file.mimes'),
            'file.max'      => __('validation_messages.file.max'),
        ];
    }
}
