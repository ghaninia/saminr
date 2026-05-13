<?php

namespace Database\Seeders;

use App\Modules\Products\Models\ProductAttribute;
use Illuminate\Database\Seeder;

class ProductAttributeSeeder extends Seeder
{
    /**
     * Seed product attributes and their reusable values.
     */
    public function run(): void
    {
        $rows = [
            [
                'key' => 'candle_color',
                'label' => ['fa' => 'رنگ شمع', 'en' => 'Candle Color'],
                'value_type' => 'color',
                'values' => [
                    ['value' => 'سفید', 'meta' => ['hex' => '#ffffff']],
                    ['value' => 'شیری', 'meta' => ['hex' => '#fff8dc']],
                    ['value' => 'کرم', 'meta' => ['hex' => '#f5deb3']],
                    ['value' => 'بژ', 'meta' => ['hex' => '#f5f5dc']],
                    ['value' => 'طلایی', 'meta' => ['hex' => '#d4af37']],
                    ['value' => 'نقره ای', 'meta' => ['hex' => '#c0c0c0']],
                    ['value' => 'زرد', 'meta' => ['hex' => '#ffd60a']],
                    ['value' => 'کهربایی', 'meta' => ['hex' => '#ffbf00']],
                    ['value' => 'نارنجی', 'meta' => ['hex' => '#ff8c00']],
                    ['value' => 'هلویی', 'meta' => ['hex' => '#ffcba4']],
                    ['value' => 'صورتی', 'meta' => ['hex' => '#ff69b4']],
                    ['value' => 'رزگلد', 'meta' => ['hex' => '#b76e79']],
                    ['value' => 'قرمز', 'meta' => ['hex' => '#dc2626']],
                    ['value' => 'زرشکی', 'meta' => ['hex' => '#800020']],
                    ['value' => 'یاسی', 'meta' => ['hex' => '#c8a2c8']],
                    ['value' => 'بنفش', 'meta' => ['hex' => '#7e22ce']],
                    ['value' => 'بنفش تیره', 'meta' => ['hex' => '#4b0082']],
                    ['value' => 'آبی آسمانی', 'meta' => ['hex' => '#87ceeb']],
                    ['value' => 'آبی', 'meta' => ['hex' => '#2563eb']],
                    ['value' => 'سرمه ای', 'meta' => ['hex' => '#1e3a8a']],
                    ['value' => 'فیروزه ای', 'meta' => ['hex' => '#40e0d0']],
                    ['value' => 'سبز نعنایی', 'meta' => ['hex' => '#98ff98']],
                    ['value' => 'سبز', 'meta' => ['hex' => '#16a34a']],
                    ['value' => 'زیتونی', 'meta' => ['hex' => '#808000']],
                    ['value' => 'قهوه ای روشن', 'meta' => ['hex' => '#a67b5b']],
                    ['value' => 'قهوه ای', 'meta' => ['hex' => '#6f4e37']],
                    ['value' => 'موکا', 'meta' => ['hex' => '#967969']],
                    ['value' => 'خاکستری', 'meta' => ['hex' => '#9ca3af']],
                    ['value' => 'دودی', 'meta' => ['hex' => '#4b5563']],
                    ['value' => 'مشکی', 'meta' => ['hex' => '#111111']],
                ],
            ],
            [
                'key' => 'candle_scent',
                'label' => ['fa' => 'رایحه شمع', 'en' => 'Candle Scent'],
                'value_type' => 'select',
                'values' => [
                    'وانیل', 'دارچین', 'قهوه', 'شکلات', 'کارامل', 'عسل', 'یاس', 'رز', 'اسطوخودوس', 'یاسمن',
                    'شکوفه پرتقال', 'بنفشه', 'ارکیده', 'یاس سفید', 'چوب صندل', 'عود', 'سدر', 'پچولی', 'مشک', 'عنبر',
                    'لیموناد', 'لیمو', 'پرتقال', 'گریپ فروت', 'ترنج', 'سیب', 'انار', 'توت فرنگی', 'انبه', 'نارگیل',
                    'دریایی', 'باران', 'پنبه', 'پودر بچه', 'نعناع', 'اکالیپتوس', 'بابونه', 'رزماری', 'سیترونلا', 'بدون رایحه',
                ],
            ],
            [
                'key' => 'candle_shape',
                'label' => ['fa' => 'شکل ظاهری شمع', 'en' => 'Candle Shape'],
                'value_type' => 'select',
                'values' => [
                    'ستونی', 'استوانه ای', 'مکعبی', 'قلمی', 'مخروطی', 'توپی', 'تخم مرغی', 'موجی', 'حلزونی', 'هرمی',
                    'قلبی', 'گل', 'برگ', 'ستاره ای', 'ماه', 'حیوانات', 'فرشته', 'مجسمه ای', 'شناور', 'وارمر',
                    'لیوانی', 'کوزه ای', 'کاسه ای', 'صدفی', 'کاپ کیکی', 'عدد و حروف',
                ],
            ],
            [
                'key' => 'candle_wick',
                'label' => ['fa' => 'فیتیله شمع', 'en' => 'Candle Wick'],
                'value_type' => 'select',
                'values' => [
                    'فیتیله پنبه ای', 'فیتیله پنبه ای تخت', 'فیتیله پنبه ای با هسته کاغذی', 'فیتیله چوبی', 'فیتیله چوبی کراکل',
                    'فیتیله کنفی', 'فیتیله بامبو', 'فیتیله زینک دار', 'فیتیله چندگانه', 'فیتیله بدون سرب',
                ],
            ],
            [
                'key' => 'candle_type',
                'label' => ['fa' => 'نوع شمع', 'en' => 'Candle Type'],
                'value_type' => 'select',
                'values' => [
                    'شمع عطری', 'شمع دکوراتیو', 'شمع وارمر', 'شمع ستونی', 'شمع قلمی', 'شمع شناور', 'شمع لیوانی', 'شمع ظرفی',
                    'شمع سویا', 'شمع پارافینی', 'شمع ژله ای', 'شمع مومی عسل', 'شمع تولد', 'شمع عددی', 'شمع مناسبتی', 'شمع ماساژ',
                ],
            ],
            [
                'key' => 'candle_weight',
                'label' => ['fa' => 'وزن شمع', 'en' => 'Candle Weight'],
                'value_type' => 'select',
                'values' => ['50 گرم', '80 گرم', '100 گرم', '150 گرم', '200 گرم', '250 گرم', '300 گرم', '400 گرم', '500 گرم', '750 گرم', '1 کیلوگرم'],
            ],
            [
                'key' => 'candle_dimensions',
                'label' => ['fa' => 'ابعاد شمع', 'en' => 'Candle Dimensions'],
                'value_type' => 'select',
                'values' => ['5x5 سانتی متر', '5x10 سانتی متر', '6x12 سانتی متر', '7x7 سانتی متر', '7x15 سانتی متر', '8x8 سانتی متر', '8x10 سانتی متر', '10x10 سانتی متر', '10x15 سانتی متر'],
            ],
            [
                'key' => 'candle_burn_time',
                'label' => ['fa' => 'زمان اتمام شمع', 'en' => 'Burn Time'],
                'value_type' => 'select',
                'values' => ['4 ساعت', '6 ساعت', '8 ساعت', '12 ساعت', '16 ساعت', '24 ساعت', '30 ساعت', '40 ساعت', '50 ساعت', '60 ساعت', '80 ساعت'],
            ],
        ];

        foreach ($rows as $index => $row) {
            $attribute = ProductAttribute::query()->updateOrCreate(
                ['key' => $row['key']],
                [
                    'label' => $row['label'],
                    'value_type' => $row['value_type'],
                    'sort_order' => $index,
                ]
            );

            foreach ($row['values'] as $valueIndex => $value) {
                $valueText = is_array($value) ? (string) ($value['value'] ?? '') : (string) $value;
                $valueMeta = is_array($value) && is_array($value['meta'] ?? null) ? $value['meta'] : null;

                $attribute->values()->updateOrCreate(
                    ['value' => $valueText],
                    [
                        'meta' => $valueMeta,
                        'sort_order' => $valueIndex,
                    ]
                );
            }
        }
    }
}