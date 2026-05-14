<?php

namespace App\Modules\Products\Http\Requests\Admin;

use App\Modules\Products\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ProductUpsertRequest extends FormRequest
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
        $product = $this->route('product');
        $ignoreId = $product instanceof Product ? $product->getKey() : (is_numeric($product) ? (int) $product : null);

        return [
            'title' => ['required', 'array'],
            'subtitle' => ['nullable', 'array'],
            'description' => ['nullable', 'array'],
            'short_link' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'short_link')->ignore($ignoreId),
            ],
            'base_price' => ['required', 'numeric', 'min:0'],
            'cover_image' => ['nullable', 'string'],
            'intro_video' => ['nullable', 'string'],
            'gallery' => ['nullable', 'array'],
            'gallery.*' => ['string'],
            'is_active' => ['required', 'boolean'],

            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['integer', Rule::exists('categories', 'id')],

            'attributes' => ['nullable', 'array'],
            'attributes.*.id' => ['nullable', 'integer', Rule::exists('product_attributes', 'id')],
            'attributes.*.key' => ['required_without:attributes.*.id', 'string', 'max:120'],
            'attributes.*.label' => ['required', 'array'],
            'attributes.*.icon_svg' => ['nullable', 'string'],
            'attributes.*.value_type' => ['required', Rule::in(['text', 'number', 'select', 'color'])],
            'attributes.*.sort_order' => ['nullable', 'integer', 'min:0'],
            'attributes.*.values' => ['required', 'array', 'min:1'],
            'attributes.*.values.*.id' => ['nullable', 'integer', Rule::exists('product_attribute_values', 'id')],
            'attributes.*.values.*.value' => ['required'],
            'attributes.*.values.*.value_i18n' => ['nullable', 'array'],
            'attributes.*.values.*.meta' => ['nullable', 'array'],
            'attributes.*.values.*.meta.hex' => ['nullable', 'string', 'max:20'],
            'attributes.*.values.*.sort_order' => ['nullable', 'integer', 'min:0'],

            'variants' => ['nullable', 'array'],
            'variants.*.sku_type' => ['required', Rule::in(['numeric', 'infinite', 'contact'])],
            'variants.*.sku' => ['nullable', 'string', 'max:255'],
            'variants.*.price' => ['required', 'numeric', 'min:0'],
            'variants.*.is_default' => ['nullable', 'boolean'],
            'variants.*.sort_order' => ['nullable', 'integer', 'min:0'],
            'variants.*.options' => ['required', 'array', 'min:1'],
            'variants.*.options.*.attribute_key' => ['required', 'string', 'max:120'],
            'variants.*.options.*.value' => ['required'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => __('validation_messages.title.required'),
            'short_link.required' => __('validation_messages.short_link.required'),
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $this->validateLocalizedObject($validator, 'title', $this->input('title'));

            $subtitle = $this->input('subtitle');
            if ($subtitle !== null) {
                $this->validateLocalizedObject($validator, 'subtitle', $subtitle);
            }

            $description = $this->input('description');
            if ($description !== null) {
                $this->validateLocalizedObject($validator, 'description', $description);
            }

            $attributes = $this->input('attributes');
            if (! is_array($attributes)) {
                return;
            }

            foreach ($attributes as $index => $attribute) {
                $label = Arr::get($attribute, 'label');
                $this->validateLocalizedObject($validator, "attributes.{$index}.label", $label);

                $values = Arr::get($attribute, 'values');
                if (! is_array($values)) {
                    continue;
                }

                foreach ($values as $valueIndex => $valueEntry) {
                    $rawValue = Arr::get($valueEntry, 'value');
                    $rawValueI18n = Arr::get($valueEntry, 'value_i18n');

                    if (is_array($rawValue)) {
                        $this->validateLocalizedObject($validator, "attributes.{$index}.values.{$valueIndex}.value", $rawValue);
                    }

                    if ($rawValueI18n !== null && is_array($rawValueI18n)) {
                        $this->validateLocalizedObject($validator, "attributes.{$index}.values.{$valueIndex}.value_i18n", $rawValueI18n);
                    }
                }
            }

            $variants = $this->input('variants');
            if (! is_array($variants)) {
                return;
            }

            foreach ($variants as $index => $variant) {
                $options = Arr::get($variant, 'options');
                if (is_array($options)) {
                    foreach ($options as $optionIndex => $option) {
                        $optionValue = Arr::get($option, 'value');
                        if (is_array($optionValue)) {
                            $this->validateLocalizedObject($validator, "variants.{$index}.options.{$optionIndex}.value", $optionValue);
                        }
                    }
                }

                $skuType = (string) Arr::get($variant, 'sku_type', 'numeric');
                $sku = Arr::get($variant, 'sku');

                if ($skuType !== 'numeric') {
                    continue;
                }

                $skuString = is_string($sku) ? trim($sku) : '';
                if ($skuString === '') {
                    $validator->errors()->add("variants.{$index}.sku", 'SKU is required when SKU type is numeric.');
                    continue;
                }

                if (! preg_match('/^[0-9]+$/', $skuString)) {
                    $validator->errors()->add("variants.{$index}.sku", 'SKU must contain only numbers when SKU type is numeric.');
                }
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

        foreach (['title', 'subtitle', 'description'] as $key) {
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

        /** @var array<int, array<string, mixed>> $attributes */
        $attributes = is_array(Arr::get($validated, 'attributes')) ? Arr::get($validated, 'attributes') : [];

        $validated['attributes'] = array_map(function (array $attribute): array {
            $values = is_array(Arr::get($attribute, 'values')) ? Arr::get($attribute, 'values') : [];

            return [
                'id' => Arr::get($attribute, 'id') !== null ? (int) Arr::get($attribute, 'id') : null,
                'key' => (string) Arr::get($attribute, 'key', ''),
                'label' => [
                    'fa' => (string) Arr::get($attribute, 'label.fa', ''),
                    'en' => (string) Arr::get($attribute, 'label.en', ''),
                ],
                'icon_svg' => Arr::get($attribute, 'icon_svg') !== null ? (string) Arr::get($attribute, 'icon_svg') : null,
                'value_type' => (string) Arr::get($attribute, 'value_type', 'select'),
                'sort_order' => (int) Arr::get($attribute, 'sort_order', 0),
                'values' => array_map(function (array $value): array {
                    $normalized = $this->normalizeLocalizedValue(
                        Arr::get($value, 'value'),
                        Arr::get($value, 'value_i18n'),
                    );

                    return [
                        'id' => Arr::get($value, 'id') !== null ? (int) Arr::get($value, 'id') : null,
                        'value' => $normalized['canonical'],
                        'value_i18n' => [
                            'fa' => $normalized['fa'],
                            'en' => $normalized['en'],
                        ],
                        'meta' => is_array(Arr::get($value, 'meta')) ? Arr::get($value, 'meta') : null,
                        'sort_order' => (int) Arr::get($value, 'sort_order', 0),
                    ];
                }, $values),
            ];
        }, $attributes);

        /** @var array<int, array<string, mixed>> $variants */
        $variants = is_array(Arr::get($validated, 'variants')) ? Arr::get($validated, 'variants') : [];

        $validated['variants'] = array_map(function (array $variant): array {
            $options = is_array(Arr::get($variant, 'options')) ? Arr::get($variant, 'options') : [];
            $skuType = (string) Arr::get($variant, 'sku_type', 'numeric');
            $rawSku = Arr::get($variant, 'sku');
            $sku = $skuType === 'numeric' ? ($rawSku !== null ? (string) $rawSku : null) : null;

            return [
                'sku_type' => $skuType,
                'sku' => $sku,
                'price' => (float) Arr::get($variant, 'price', 0),
                'is_default' => (bool) Arr::get($variant, 'is_default', false),
                'sort_order' => (int) Arr::get($variant, 'sort_order', 0),
                'options' => array_map(fn (array $option): array => [
                    'attribute_key' => (string) Arr::get($option, 'attribute_key', ''),
                    'value' => $this->canonicalValueFromMixed(Arr::get($option, 'value')),
                ], $options),
            ];
        }, $variants);

        $validated['category_ids'] = array_values(array_map('intval', (array) Arr::get($validated, 'category_ids', [])));
        $validated['gallery'] = array_values(array_filter((array) Arr::get($validated, 'gallery', []), static fn ($value): bool => is_string($value) && $value !== ''));
        $validated['base_price'] = (float) Arr::get($validated, 'base_price', 0);
        $validated['is_active'] = (bool) Arr::get($validated, 'is_active', true);

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

    /**
     * @param mixed $value
     * @param mixed $valueI18n
     * @return array{fa: string, en: string, canonical: string}
     */
    private function normalizeLocalizedValue(mixed $value, mixed $valueI18n): array
    {
        $fa = '';
        $en = '';

        if (is_array($value)) {
            $fa = (string) Arr::get($value, 'fa', '');
            $en = (string) Arr::get($value, 'en', '');
        } elseif (is_string($value)) {
            $fa = $value;
            $en = $value;
        }

        if (is_array($valueI18n)) {
            $fa = (string) Arr::get($valueI18n, 'fa', $fa);
            $en = (string) Arr::get($valueI18n, 'en', $en);
        }

        $canonical = trim($en !== '' ? $en : $fa);
        if ($canonical === '') {
            $canonical = trim((string) (is_string($value) ? $value : ''));
        }

        return [
            'fa' => $fa,
            'en' => $en,
            'canonical' => $canonical,
        ];
    }

    private function canonicalValueFromMixed(mixed $value): string
    {
        if (is_array($value)) {
            return trim((string) (Arr::get($value, 'en') ?: Arr::get($value, 'fa') ?: ''));
        }

        return trim((string) $value);
    }
}
