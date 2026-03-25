<?php

namespace App\Modules\Reviews\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ReviewUpsertRequest extends FormRequest
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
            'fullname'  => ['required', 'array'],
            'review'    => ['required', 'array'],
            'star'      => ['required', 'integer', 'min:1', 'max:5'],
            'avatar'    => ['nullable', 'string'],
            'user_type' => ['required', Rule::in(['customer', 'admin', 'founder'])],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'fullname.required'  => __('validation_messages.fullname.required'),
            'review.required'    => __('validation_messages.review.required'),
            'star.required'      => __('validation_messages.star.required'),
            'star.min'           => __('validation_messages.star.min'),
            'star.max'           => __('validation_messages.star.max'),
            'user_type.required' => __('validation_messages.user_type.required'),
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $this->validateLocalizedObject($validator, 'fullname', $this->input('fullname'));
            $this->validateLocalizedObject($validator, 'review', $this->input('review'));
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function validatedPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        foreach (['fullname', 'review'] as $key) {
            if (! array_key_exists($key, $validated) || ! is_array($validated[$key])) {
                continue;
            }

            $validated[$key] = [
                'fa' => (string) Arr::get($validated[$key], 'fa', ''),
                'en' => (string) Arr::get($validated[$key], 'en', ''),
            ];
        }

        return $validated;
    }

    /**
     * @param array<string, mixed>|mixed $value
     */
    private function validateLocalizedObject(Validator $validator, string $path, mixed $value): void
    {
        if (! is_array($value) || ! Arr::isAssoc($value)) {
            $validator->errors()->add($path, "The {$path} must be an object with language keys.");

            return;
        }

        foreach ($value as $lang => $text) {
            if (! is_string($lang)) {
                $validator->errors()->add("{$path}", "The {$path} keys must be strings.");

                return;
            }
            if (! is_string($text) && $text !== null) {
                $validator->errors()->add("{$path}.{$lang}", "The {$path}.{$lang} must be a string.");
            }
        }
    }
}
