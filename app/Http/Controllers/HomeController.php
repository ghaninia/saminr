<?php

namespace App\Http\Controllers;

use App\Modules\Settings\Services\Contracts\SettingServiceInterface;
use Illuminate\Http\Request;
use Illuminate\View\View;

class HomeController extends Controller
{
    public function __invoke(Request $request, SettingServiceInterface $settingService): View
    {
        $locale = $this->resolveLocale($request);

        $settings = $settingService
            ->listAll()
            ->mapWithKeys(fn ($setting) => [$setting->key => $setting->value])
            ->all();

        $getSetting = static fn (string $key, mixed $fallback = null): mixed => $settings[$key] ?? $fallback;

        $site = [
            'locale' => $locale,
            'dir' => $locale === 'fa' ? 'rtl' : 'ltr',
            'title' => (string) $this->localized($getSetting('title', 'Samin Candle Studio'), $locale),
            'description' => (string) $this->localized(
                $getSetting('description', 'Handcrafted scented and decorative candles for gifts, home styling, and special events.'),
                $locale
            ),
            'aboutus' => (string) $this->localized($getSetting('aboutus', ''), $locale),
            'address' => (string) $this->localized($getSetting('address', ''), $locale),
            'phone' => (string) $getSetting('phone', ''),
            'mobile' => (string) $getSetting('mobile', ''),
            'email' => (string) $getSetting('email', ''),
            'instagram' => (string) $getSetting('instagram', ''),
            'telegram' => (string) $getSetting('telegram', ''),
            'aparat' => (string) $getSetting('aparat', ''),
            'youtube' => (string) $getSetting('youtube', ''),
            'copyright' => (string) $this->localized($getSetting('copyright', ''), $locale),
            'product_intro_url' => (string) $getSetting('product_intro_url', ''),
            'site_url' => rtrim((string) $getSetting('site_url', config('app.url', $request->getSchemeAndHttpHost())), '/'),
        ];

        $metaImage = (string) $getSetting('meta_image', '/images/video-cover.avif');
        $metaImage = $this->absoluteUrl($metaImage, $site['site_url']);
        $favicon = $this->absoluteUrl((string) $getSetting('favicon', '/favicon.ico'), $site['site_url']);
        $appleTouchIcon = $this->absoluteUrl((string) $getSetting('apple_touch_icon', '/favicon.ico'), $site['site_url']);

        $meta = [
            'lang' => $site['locale'],
            'dir' => $site['dir'],
            'title' => $site['title'],
            'description' => $site['description'],
            'keywords' => (string) $this->localized($getSetting('meta_keywords', ''), $locale),
            'canonical' => $request->url(),
            'robots' => (string) $getSetting('meta_robots', 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1'),
            'site_name' => $site['title'],
            'site_url' => $site['site_url'],
            'image' => $metaImage,
            'locale' => $locale === 'fa' ? 'fa_IR' : 'en_US',
            'type' => (string) $getSetting('og_type', 'website'),
            'twitter_site' => (string) $getSetting('twitter_site', '@samincandle'),
            'favicon' => $favicon,
            'apple_touch_icon' => $appleTouchIcon,
            'default_theme' => (string) $getSetting('default_theme', 'dark'),
        ];

        return view('home', [
            'meta' => $meta,
            'site' => $site,
        ]);
    }

    private function resolveLocale(Request $request): string
    {
        $locale = $request->getPreferredLanguage(['fa', 'en']) ?? 'fa';

        return in_array($locale, ['fa', 'en'], true) ? $locale : 'fa';
    }

    private function localized(mixed $value, string $locale): mixed
    {
        if (! is_array($value)) {
            return $value;
        }

        if (array_key_exists('fa', $value) || array_key_exists('en', $value)) {
            return $value[$locale] ?? $value['fa'] ?? $value['en'] ?? null;
        }

        return $value;
    }

    private function absoluteUrl(string $pathOrUrl, string $siteUrl): string
    {
        if (str_starts_with($pathOrUrl, 'http://') || str_starts_with($pathOrUrl, 'https://')) {
            return $pathOrUrl;
        }

        return $siteUrl.'/'.ltrim($pathOrUrl, '/');
    }
}
