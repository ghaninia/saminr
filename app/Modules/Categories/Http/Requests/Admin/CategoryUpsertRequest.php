<?php

namespace App\Modules\Categories\Http\Requests\Admin;

use App\Modules\Categories\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class CategoryUpsertRequest extends FormRequest
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
        $category = $this->route('category');
        $ignoreId = $category instanceof Category ? $category->getKey() : (is_numeric($category) ? (int) $category : null);

        return [
            'title' => ['required', 'array'],
            'subtitle' => ['required', 'array'],
            'content' => ['nullable', 'array'],
            'color' => ['nullable', 'string'],
            'icon' => ['nullable', 'string'],
            'short_link' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'short_link')->ignore($ignoreId),
            ],
            'image' => ['nullable', 'string'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => __('validation_messages.title.required'),
            'subtitle.required' => __('validation_messages.subtitle.required'),
            'short_link.required' => __('validation_messages.short_link.required'),
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $this->validateLocalizedObject($validator, 'title', $this->input('title'));
            $this->validateLocalizedObject($validator, 'subtitle', $this->input('subtitle'));

            $content = $this->input('content');
            if ($content !== null) {
                $this->validateLocalizedObject($validator, 'content', $content);
            }
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function validatedPayload(): array
    {
        /** @var array<string, mixed> $validated */
        $validated = $this->validated();

        foreach (['title', 'subtitle', 'content'] as $key) {
            if (! array_key_exists($key, $validated)) {
                continue;
            }
            if ($validated[$key] === null) {
                continue;
            }
            if (! is_array($validated[$key])) {
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
            $validator->errors()->add($path, __('validation_messages.localized_object.object'));
            return;
        }

        if (! array_key_exists('fa', $value) || ! array_key_exists('en', $value)) {
            $validator->errors()->add($path, __('validation_messages.localized_object.keys'));
            return;
        }

        if (! is_string($value['fa']) || ! is_string($value['en'])) {
            $validator->errors()->add($path, __('validation_messages.localized_object.strings'));
        }
    }
}

