<?php

namespace App\Modules\Reviews\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Arr;

/** @mixin \App\Modules\Reviews\Models\Review */
class ClientReviewResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $lang = strtolower((string) $request->query('lang', app()->getLocale()));
        $lang = in_array($lang, ['fa', 'en'], true) ? $lang : 'en';
        $fallbackLang = $lang === 'fa' ? 'en' : 'fa';

        $fullname = is_array($this->fullname) ? $this->fullname : [];
        $review = is_array($this->review) ? $this->review : [];

        return [
            'id' => $this->id,
            'fullname' => $fullname,
            'review' => $review,
            'name' => (string) (Arr::get($fullname, $lang) ?? Arr::get($fullname, $fallbackLang) ?? ''),
            'text' => (string) (Arr::get($review, $lang) ?? Arr::get($review, $fallbackLang) ?? ''),
            'star' => (int) ($this->star ?? 0),
            'avatar' => $this->avatar,
            'user_type' => (string) ($this->user_type ?? 'customer'),
            'user_type_label' => $this->resolveUserTypeLabel((string) ($this->user_type ?? 'customer'), $lang),
            'created_at' => $this->created_at,
        ];
    }

    private function resolveUserTypeLabel(string $type, string $lang): string
    {
        return match ($type) {
            'admin' => $lang === 'fa' ? 'مدیر' : 'Admin',
            'founder' => $lang === 'fa' ? 'بنیان‌گذار' : 'Founder',
            default => $lang === 'fa' ? 'مشتری' : 'Customer',
        };
    }
}
