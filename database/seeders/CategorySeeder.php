<?php

namespace Database\Seeders;

use App\Modules\Categories\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rows = [
            [
                'short_link' => 'wood-wick-candle',
                'title' => ['en' => 'Wood Wick Candle', 'fa' => 'شمع فتیله چوبی'],
                'subtitle' => ['en' => 'Natural wood wick', 'fa' => 'فتیله چوبی طبیعی'],
                'content' => [
                    'en' => 'A cozy crackling candle with a natural wood wick.',
                    'fa' => 'شمعی گرم با فتیله چوبی طبیعی و صدای دلنشین.',
                ],
                'color' => '#C9A46B',
                'icon' => 'wood-wick',
            ],
            [
                'short_link' => 'soy-candle',
                'title' => ['en' => 'Soy Candle', 'fa' => 'شمع سویا'],
                'subtitle' => ['en' => 'Eco-friendly soy wax', 'fa' => 'موم سویا دوستدار محیط‌زیست'],
                'content' => [
                    'en' => 'Clean-burning soy wax candles for everyday moments.',
                    'fa' => 'شمع‌های سویا با سوخت پاک برای استفاده روزمره.',
                ],
                'color' => '#E6E1D6',
                'icon' => 'soy',
            ],
            [
                'short_link' => 'sparklers',
                'title' => ['en' => 'Sparklers', 'fa' => 'فشفشه'],
                'subtitle' => ['en' => 'Sparkling effects', 'fa' => 'افکت‌های درخشان'],
                'content' => [
                    'en' => 'Sparkling items to make celebrations shine.',
                    'fa' => 'برای درخشان‌تر کردن جشن‌ها و لحظه‌های خاص.',
                ],
                'color' => '#F6C453',
                'icon' => 'sparkles',
            ],
            [
                'short_link' => 'trick-candle',
                'title' => ['en' => 'Trick Candle', 'fa' => 'شمع شوخی'],
                'subtitle' => ['en' => 'Fun trick candles', 'fa' => 'شمع‌های شوخی و سرگرم‌کننده'],
                'content' => [
                    'en' => 'Playful candles for surprises and laughs.',
                    'fa' => 'شمع‌های بامزه برای سورپرایز و خنده.',
                ],
                'color' => '#E36B6B',
                'icon' => 'trick',
            ],
            [
                'short_link' => 'floating-candle',
                'title' => ['en' => 'Floating Candle', 'fa' => 'شمع شناور'],
                'subtitle' => ['en' => 'Floating on water', 'fa' => 'شناور روی آب'],
                'content' => [
                    'en' => 'Designed to float and glow on water surfaces.',
                    'fa' => 'طراحی‌شده برای شناور ماندن و نورپردازی روی آب.',
                ],
                'color' => '#5BC0BE',
                'icon' => 'water',
            ],
            [
                'short_link' => 'citronella-candle',
                'title' => ['en' => 'Citronella Candle', 'fa' => 'شمع سیترونلا'],
                'subtitle' => ['en' => 'Mosquito repellent', 'fa' => 'دورکننده پشه'],
                'content' => [
                    'en' => 'Outdoor-friendly candles with citronella scent.',
                    'fa' => 'مناسب فضای باز با رایحه سیترونلا برای دور کردن پشه.',
                ],
                'color' => '#9BC53D',
                'icon' => 'citronella',
            ],
            [
                'short_link' => 'taper-candle',
                'title' => ['en' => 'Taper Candle', 'fa' => 'شمع قلمی'],
                'subtitle' => ['en' => 'Classic taper design', 'fa' => 'طراحی کلاسیک قلمی'],
                'content' => [
                    'en' => 'Elegant taper candles for tables and events.',
                    'fa' => 'شمع‌های قلمی شیک برای میز و مراسم.',
                ],
                'color' => '#B9B0FF',
                'icon' => 'taper',
            ],
            [
                'short_link' => 'pillar-candle',
                'title' => ['en' => 'Pillar Candle', 'fa' => 'شمع ستونی'],
                'subtitle' => ['en' => 'Sturdy pillar shape', 'fa' => 'فرم ستونی محکم'],
                'content' => [
                    'en' => 'Sturdy pillar candles with a clean, bold look.',
                    'fa' => 'شمع‌های ستونی مقاوم با ظاهر ساده و چشمگیر.',
                ],
                'color' => '#8D99AE',
                'icon' => 'pillar',
            ],
        ];

        foreach ($rows as $row) {
            $shortLink = $row['short_link'] ?? Str::slug($row['title']['en'] ?? '');

            Category::query()->updateOrCreate(
                ['short_link' => $shortLink],
                [
                    'title' => $row['title'],
                    'subtitle' => $row['subtitle'],
                    'content' => $row['content'] ?? ['fa' => '', 'en' => ''],
                    'color' => $row['color'] ?? null,
                    'icon' => $row['icon'] ?? null,
                    'image' => null,
                ]
            );
        }
    }
}
