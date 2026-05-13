<?php

namespace App\Modules\Products\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ProductSetStatusRequest extends FormRequest
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
            'is_active' => ['required', 'boolean'],
        ];
    }

    public function isActive(): bool
    {
        return (bool) $this->validated('is_active');
    }
}
