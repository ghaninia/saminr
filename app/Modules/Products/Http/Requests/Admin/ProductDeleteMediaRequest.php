<?php

namespace App\Modules\Products\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductDeleteMediaRequest extends FormRequest
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
            'field' => ['required', 'string', Rule::in(['cover_image', 'intro_video', 'gallery'])],
            'index' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function field(): string
    {
        return (string) $this->validated('field');
    }

    public function mediaIndex(): ?int
    {
        $index = $this->validated('index');

        return $index === null ? null : (int) $index;
    }
}
