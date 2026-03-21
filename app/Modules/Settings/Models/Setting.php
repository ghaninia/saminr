<?php

namespace App\Modules\Settings\Models;

use App\Modules\Settings\Enums\SettingType;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Setting extends Model implements HasMedia
{
    use HasFactory;
    use InteractsWithMedia;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'key',
        'value',
        'default',
        'type',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => SettingType::class,
        ];
    }

    /**
     * When value is null, transparently fall back to default.
     * JSON is decoded automatically for MULTIPLE and ARRAY types.
     */
    protected function value(): Attribute
    {
        return Attribute::get(function (mixed $value): mixed {
            $raw = $value ?? $this->attributes['default'] ?? null;

            return in_array($this->type, [SettingType::MULTIPLE, SettingType::ARRAY], true)
                ? $this->decodeJson($raw)
                : $raw;
        });
    }

    /**
     * The decoded default value for MULTIPLE/ARRAY type, raw string for others.
     */
    protected function resolvedDefault(): Attribute
    {
        return Attribute::get(function (): mixed {
            return in_array($this->type, [SettingType::MULTIPLE, SettingType::ARRAY], true)
                ? $this->decodeJson($this->attributes['default'] ?? null)
                : ($this->attributes['default'] ?? null);
        });
    }

    public function registerMediaCollections(): void
    {
        // Use the setting key as the collection name and keep only one file per key.
        if (! empty($this->key)) {
            $this->addMediaCollection($this->key)->singleFile();
        }
    }

    private function decodeJson(?string $value): mixed
    {
        if ($value === null) {
            return null;
        }

        $decoded = json_decode($value, true);

        return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
    }
}
