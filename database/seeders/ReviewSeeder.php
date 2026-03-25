<?php

namespace Database\Seeders;

use App\Modules\Reviews\Models\Review;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rows = [
            [
                'fullname'  => ['fa' => 'پوریا میرزایی', 'en' => 'Pourya Mirzaei'],
                'review'    => [
                    'fa' => 'شمع‌های این مجموعه واقعاً بی‌نظیرند. کیفیت عالی و بوی دلپذیر آن‌ها هر فضایی را جادویی می‌کند.',
                    'en' => 'The candles in this collection are truly exceptional. Their premium quality and pleasant scent make any space magical.',
                ],
                'star'      => 5,
                'avatar'    => null,
                'user_type' => 'customer',
            ],
            [
                'fullname'  => ['fa' => 'نسترن سلطانی', 'en' => 'Nastaran Soltani'],
                'review'    => [
                    'fa' => 'خرید من از سامینر یک تجربه فوق‌العاده بود. ارسال سریع و بسته‌بندی زیبا. حتماً دوباره سفارش می‌دهم.',
                    'en' => 'My purchase from Saminr was a fantastic experience. Fast delivery and beautiful packaging. I will definitely order again.',
                ],
                'star'      => 5,
                'avatar'    => null,
                'user_type' => 'customer',
            ],
            [
                'fullname'  => ['fa' => 'فروغ فدایی', 'en' => 'Forugh Fadaei'],
                'review'    => [
                    'fa' => 'شمع‌های سویا این برند سوخت بسیار تمیزی دارند و دوام آن‌ها از سایر برندها بیشتر است.',
                    'en' => 'The soy candles from this brand burn very cleanly and last longer than other brands I\'ve tried.',
                ],
                'star'      => 4,
                'avatar'    => null,
                'user_type' => 'customer',
            ],
            [
                'fullname'  => ['fa' => 'کیانا رحیمی', 'en' => 'Kiana Rahimi'],
                'review'    => [
                    'fa' => 'هدیه‌ای که برای دوستم خریدم را بسیار دوست داشت. طراحی ظروف شمع‌ها واقعاً منحصربه‌فرد است.',
                    'en' => 'My friend absolutely loved the gift I bought for her. The candle vessel designs are truly unique.',
                ],
                'star'      => 5,
                'avatar'    => null,
                'user_type' => 'customer',
            ],
            [
                'fullname'  => ['fa' => 'آرمین تهرانی', 'en' => 'Armin Tehrani'],
                'review'    => [
                    'fa' => 'شمع فتیله چوبی که خریدم صدای قطره باران دارد و فضای خانه را کاملاً آرامش‌بخش کرده است.',
                    'en' => 'The wood wick candle I purchased has a rain-drop sound and has made my home completely relaxing.',
                ],
                'star'      => 5,
                'avatar'    => null,
                'user_type' => 'customer',
            ],
            [
                'fullname'  => ['fa' => 'مهسا کریمی', 'en' => 'Mahsa Karimi'],
                'review'    => [
                    'fa' => 'قیمت‌گذاری منصفانه برای کیفیتی که ارائه می‌شود. محصولات کاملاً طبیعی و دوستدار محیط زیست.',
                    'en' => 'Fair pricing for the quality offered. Completely natural and eco-friendly products.',
                ],
                'star'      => 4,
                'avatar'    => null,
                'user_type' => 'customer',
            ],
            [
                'fullname'  => ['fa' => 'دانیال مرادی', 'en' => 'Danial Moradi'],
                'review'    => [
                    'fa' => 'برای اولین بار از این برند خرید کردم و کاملاً راضی هستم. پشتیبانی پاسخگو و خوش‌برخورد.',
                    'en' => 'First time buying from this brand and I\'m completely satisfied. Responsive and friendly support.',
                ],
                'star'      => 5,
                'avatar'    => null,
                'user_type' => 'customer',
            ],
            [
                'fullname'  => ['fa' => 'سارا موسوی', 'en' => 'Sara Mousavi'],
                'review'    => [
                    'fa' => 'عطر شمع لاوندر که خریدم تمام اتاق را پر از رایحه دلپذیر کرده. یکی از بهترین خریدهایم بود.',
                    'en' => 'The lavender candle I bought filled the entire room with a pleasant scent. One of my best purchases.',
                ],
                'star'      => 5,
                'avatar'    => null,
                'user_type' => 'customer',
            ],
            [
                'fullname'  => ['fa' => 'رضا اکبری', 'en' => 'Reza Akbari'],
                'review'    => [
                    'fa' => 'هر شمع خریدم حداقل ۴۰ ساعت سوخت. عالی بود. محصول را به همه توصیه می‌کنم.',
                    'en' => 'Every candle I bought burned for at least 40 hours. Excellent. I recommend the product to everyone.',
                ],
                'star'      => 4,
                'avatar'    => null,
                'user_type' => 'customer',
            ],
            [
                'fullname'  => ['fa' => 'الهام جعفری', 'en' => 'Elham Jafari'],
                'review'    => [
                    'fa' => 'شمع‌های جشن تولدم را از اینجا تهیه کردم. همه مهمانان از زیبایی و کیفیتشان تعریف کردند.',
                    'en' => 'I got my birthday party candles from here. All guests praised their beauty and quality.',
                ],
                'star'      => 5,
                'avatar'    => null,
                'user_type' => 'customer',
            ],
        ];

        foreach ($rows as $row) {
            Review::query()->create($row);
        }
    }
}
