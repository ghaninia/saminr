<?php

namespace Database\Seeders;

use App\Modules\Settings\Enums\SettingType;
use App\Modules\Settings\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Setting::query()->where('key', 'theme_color')->delete();

        $localized = static fn (string $fa, string $en): string => json_encode([
            'fa' => $fa,
            'en' => $en,
        ], JSON_UNESCAPED_UNICODE);

        $slogans = json_encode([
            ['fa' => 'روشنایی دست ساز برای لحظه های ماندگار', 'en' => 'Handcrafted light for lasting moments'],
            ['fa' => 'رایحه ای گرم برای خانه ای آرام', 'en' => 'A warm fragrance for a calm home'],
            ['fa' => 'شمع های خاص برای هدیه های خاص', 'en' => 'Special candles for special gifts'],
            ['fa' => 'زیبایی که می سوزد و گرما می بخشد', 'en' => 'Beauty that burns and gives warmth'],
            ['fa' => 'هر شمع، یک داستان منحصر به فرد', 'en' => 'Every candle, a unique story'],
            ['fa' => 'بوی خاطره، نور حضور', 'en' => 'The scent of memory, the light of presence'],
            ['fa' => 'از دست های ما، به دل خانه ی شما', 'en' => 'From our hands to the heart of your home'],
        ], JSON_UNESCAPED_UNICODE);

        $settings = [
            'slogan' => [
                'value'   => $slogans,
                'default' => $slogans,
                'type'    => SettingType::MULTIPLE,
            ],
            'title' => [
                'default' => $localized('شمع سازی ثمین', 'Samin Candle Studio'),
                'type' => SettingType::MULTIPLE,
            ],
            'description' => [
                'default' => $localized(
                    'تولید و فروش شمع های دست ساز، معطر و دکوراتیو برای هدیه، منزل و مراسم خاص.',
                    'Handcrafted scented and decorative candles for gifts, home styling, and special events.'
                ),
                'type' => SettingType::MULTIPLE,
            ],
            'logo' => [
                'default' => '/images/branding/logo-en-candle.png',
                'type' => SettingType::FILE,
            ],
            'copyright' => [
                'default' => $localized(
                    'تمامی حقوق این وب سایت برای شمع سازی ثمین محفوظ است.',
                    'All rights reserved for Samin Candle Studio.'
                ),
                'type' => SettingType::MULTIPLE,
            ],
            'aboutus' => [
                'default' => $localized(
                    'ما در شمع سازی ثمین با استفاده از موم باکیفیت و رایحه های الهام گرفته از طبیعت، شمع هایی می سازیم که فضا را گرم، آرام و متفاوت می کنند.',
                    'At Samin Candle Studio, we craft premium candles with clean wax and nature-inspired scents to create warm, calming, and memorable spaces.'
                ),
                'type' => SettingType::MULTIPLE,
            ],
            'phone' => [
                'default' => '02112345678',
                'type' => SettingType::TEXT,
            ],
            'email' => [
                'default' => 'info@samincandle.ir',
                'type' => SettingType::EMAIL,
            ],
            'mobile' => [
                'default' => '09121234567',
                'type' => SettingType::TEXT,
            ],
            'address' => [
                'default' => $localized(
                    'تهران، خیابان ولیعصر، پلاک ۱۲۳',
                    '123 Vali Asr Street, Tehran'
                ),
                'type' => SettingType::MULTIPLE,
            ],
            'instagram' => [
                'default' => 'https://instagram.com/samincandle',
                'type' => SettingType::WEBSITE,
            ],
            'telegram' => [
                'default' => 'https://t.me/samincandle',
                'type' => SettingType::WEBSITE,
            ],
            'aparat' => [
                'default' => 'https://www.aparat.com/samincandle',
                'type' => SettingType::WEBSITE,
            ],
            'youtube' => [
                'default' => 'https://www.youtube.com/@samincandle',
                'type' => SettingType::WEBSITE,
            ],
            'product_intro_url' => [
                'default' => 'https://samincandle.ir/products',
                'type' => SettingType::WEBSITE,
            ],
            'site_url' => [
                'default' => 'https://samincandle.ir',
                'type' => SettingType::WEBSITE,
            ],
            'meta_keywords' => [
                'default' => $localized(
                    'شمع سازی, شمع دست ساز, شمع معطر, شمع دکوراتیو, خرید شمع',
                    'candle studio, handmade candles, scented candles, decorative candles, buy candles'
                ),
                'type' => SettingType::MULTIPLE,
            ],
            'meta_image' => [
                'default' => '/images/video-cover.avif',
                'type' => SettingType::FILE,
            ],
            'meta_robots' => [
                'default' => 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1',
                'type' => SettingType::TEXT,
            ],
            'og_type' => [
                'default' => 'website',
                'type' => SettingType::TEXT,
            ],
            'twitter_site' => [
                'default' => '@samincandle',
                'type' => SettingType::TEXT,
            ],
            'favicon' => [
                'default' => '/favicon.ico',
                'type' => SettingType::FILE,
            ],
            'apple_touch_icon' => [
                'default' => '/favicon.ico',
                'type' => SettingType::FILE,
            ],
            'default_theme' => [
                'default' => 'dark',
                'type' => SettingType::TEXT,
            ],
            'dashboard_items_per_page' => [
                'default' => '10',
                'type' => SettingType::NUMBER,
            ],
        ];

        foreach ($settings as $key => $payload) {
            Setting::query()->updateOrCreate(
                ['key' => $key],
                [
                    'value' => $payload['value'] ?? null,
                    'default' => $payload['default'],
                    'type' => $payload['type'],
                ]
            );
        }
    }
}
