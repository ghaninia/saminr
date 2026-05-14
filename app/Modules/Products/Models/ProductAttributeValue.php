<?php

namespace App\Modules\Products\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductAttributeValue extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'product_attribute_id',
        'value',
        'meta',
        'sort_order',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'meta' => 'array',
            'sort_order' => 'integer',
        ];
    }

    /** @return array{fa: string, en: string} */
    public function getValueI18nAttribute(): array
    {
        $raw = $this->attributes['value'] ?? '';
        if (! is_string($raw)) {
            return ['fa' => '', 'en' => ''];
        }

        $decoded = json_decode($raw, true);
        if (is_array($decoded) && array_key_exists('fa', $decoded) && array_key_exists('en', $decoded)) {
            return [
                'fa' => (string) ($decoded['fa'] ?? ''),
                'en' => (string) ($decoded['en'] ?? ''),
            ];
        }

        return [
            'fa' => $raw,
            'en' => $raw,
        ];
    }

    public function getCanonicalValueAttribute(): string
    {
        $i18n = $this->value_i18n;

        $canonical = trim((string) ($i18n['en'] !== '' ? $i18n['en'] : $i18n['fa']));

        return $canonical;
    }

    /** @return BelongsTo<ProductAttribute, $this> */
    public function attribute(): BelongsTo
    {
        return $this->belongsTo(ProductAttribute::class, 'product_attribute_id');
    }

    /** @return HasMany<ProductVariantOption, $this> */
    public function variantOptions(): HasMany
    {
        return $this->hasMany(ProductVariantOption::class, 'product_attribute_value_id');
    }

    /** @return BelongsToMany<Product, $this> */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_attribute_value_product')->withTimestamps();
    }
}
