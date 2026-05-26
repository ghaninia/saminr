<?php

namespace App\Modules\Contacts\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ContactReplyRequest extends FormRequest
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
            'content' => ['required', 'string', 'max:10000'],
        ];
    }
}
