<?php

namespace App\Modules\Contacts\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;

class ContactMessageStoreRequest extends FormRequest
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
            'fullname' => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255'],
            'content'  => ['required', 'string', 'max:5000'],
        ];
    }
}
