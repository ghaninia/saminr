<!DOCTYPE html>
<html lang="{{ $meta['lang'] ?? 'fa' }}" dir="{{ $meta['dir'] ?? 'rtl' }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ $meta['title'] ?? ($site['title'] ?? __('meta.site_title')) }}</title>
        <meta name="description" content="{{ $meta['description'] ?? '' }}">
        <meta name="keywords" content="{{ $meta['keywords'] ?? '' }}">
        <meta name="robots" content="{{ $meta['robots'] ?? 'index,follow' }}">
        <link rel="canonical" href="{{ $meta['canonical'] ?? url()->current() }}">
        <link rel="icon" type="image/x-icon" href="{{ $meta['favicon'] ?? '/favicon.ico' }}">
        <link rel="shortcut icon" href="{{ $meta['favicon'] ?? '/favicon.ico' }}">
        <link rel="apple-touch-icon" href="{{ $meta['apple_touch_icon'] ?? ($meta['favicon'] ?? '/favicon.ico') }}">
        <meta name="theme-color" content="{{ $meta['default_theme'] ?? 'dark' }}">

        <meta property="og:type" content="{{ $meta['type'] ?? 'website' }}">
        <meta property="og:title" content="{{ $meta['title'] ?? ($site['title'] ?? __('meta.site_title')) }}">
        <meta property="og:description" content="{{ $meta['description'] ?? '' }}">
        <meta property="og:url" content="{{ $meta['canonical'] ?? url()->current() }}">
        <meta property="og:site_name" content="{{ $meta['site_name'] ?? ($site['title'] ?? __('meta.site_title')) }}">
        <meta property="og:image" content="{{ $meta['image'] ?? '' }}">
        <meta property="og:locale" content="{{ $meta['locale'] ?? 'fa_IR' }}">

        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $meta['title'] ?? ($site['title'] ?? __('meta.site_title')) }}">
        <meta name="twitter:description" content="{{ $meta['description'] ?? '' }}">
        <meta name="twitter:image" content="{{ $meta['image'] ?? '' }}">
        <meta name="twitter:site" content="{{ $meta['twitter_site'] ?? '' }}">

        <script type="application/ld+json">
            {!! json_encode([
                '@context' => 'https://schema.org',
                '@type' => 'Organization',
                'name' => $site['title'] ?? null,
                'description' => $site['description'] ?? null,
                'url' => $meta['site_url'] ?? null,
                'logo' => $meta['image'] ?? null,
                'email' => $site['email'] ?? null,
                'telephone' => $site['phone'] ?? null,
                'sameAs' => array_values(array_filter([
                    $site['instagram'] ?? null,
                    $site['aparat'] ?? null,
                    $site['youtube'] ?? null,
                    $site['telegram'] ?? null,
                ])),
                'address' => [
                    '@type' => 'PostalAddress',
                    'streetAddress' => $site['address'] ?? null,
                ],
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) !!}
        </script>

        @viteReactRefresh
        @vite(['resources/application/app.jsx'])
    </head>
    <body>
        <div id="app"></div>
    </body>
</html>
