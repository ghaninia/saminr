<?php

namespace App\Modules\Users\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UserUploadRequest extends FormRequest
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
}
