<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Settings\Services\Contracts\SettingServiceInterface;
use Illuminate\Http\Request;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function __invoke(Request $request, SettingServiceInterface $settingService): View
    {
        $siteUrl = (string) ($settingService->getValue('site_url') ?: config('app.url', $request->getSchemeAndHttpHost()));
        $siteUrl = rtrim($siteUrl, '/');

        $favicon = (string) ($settingService->getValue('favicon') ?: '/favicon.ico');
        $appleTouchIcon = (string) ($settingService->getValue('apple_touch_icon') ?: $favicon);

        $meta = [
            'lang' => 'en',
            'dir' => 'ltr',
            'title' => 'Admin Dashboard',
            'description' => 'Admin dashboard for managing the website.',
            'keywords' => '',
            'canonical' => $request->url(),
            'robots' => 'noindex,nofollow',
            'site_name' => 'Admin Dashboard',
            'site_url' => $siteUrl,
            'image' => '',
            'locale' => 'en_US',
            'type' => 'website',
            'twitter_site' => '',
            'favicon' => $this->absoluteUrl($favicon, $siteUrl),
            'apple_touch_icon' => $this->absoluteUrl($appleTouchIcon, $siteUrl),
            'default_theme' => 'dark',
        ];

        $site = [
            'locale' => 'en',
            'dir' => 'ltr',
            'title' => $meta['title'],
            'description' => $meta['description'],
            'site_url' => $siteUrl,
        ];

        return view('admin', [
            'meta' => $meta,
            'site' => $site,
        ]);
    }

    private function absoluteUrl(string $pathOrUrl, string $siteUrl): string
    {
        if (str_starts_with($pathOrUrl, 'http://') || str_starts_with($pathOrUrl, 'https://')) {
            return $pathOrUrl;
        }

        return $siteUrl.'/'.ltrim($pathOrUrl, '/');
    }
}

