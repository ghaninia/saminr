<?php

namespace App\Modules\Settings\Models;

use App\Modules\Settings\Enums\SettingType;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

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

    private function decodeJson(?string $value): mixed
    {
        if ($value === null) {
            return null;
        }

        $decoded = json_decode($value, true);

        return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
    }
}
