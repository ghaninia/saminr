<!DOCTYPE html>
<html lang="{{ $meta['lang'] ?? 'en' }}" dir="{{ $meta['dir'] ?? 'ltr' }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ $meta['title'] ?? __('meta.admin_title') }}</title>
        <meta name="description" content="{{ $meta['description'] ?? '' }}">
        <meta name="keywords" content="{{ $meta['keywords'] ?? '' }}">
        <meta name="robots" content="{{ $meta['robots'] ?? 'noindex,nofollow' }}">
        <link rel="canonical" href="{{ $meta['canonical'] ?? url()->current() }}">
        <link rel="icon" type="image/x-icon" href="{{ $meta['favicon'] ?? '/favicon.ico' }}">
        <link rel="shortcut icon" href="{{ $meta['favicon'] ?? '/favicon.ico' }}">
        <link rel="apple-touch-icon" href="{{ $meta['apple_touch_icon'] ?? ($meta['favicon'] ?? '/favicon.ico') }}">
        <meta name="theme-color" content="{{ $meta['default_theme'] ?? 'dark' }}">

        <meta property="og:type" content="{{ $meta['type'] ?? 'website' }}">
        <meta property="og:title" content="{{ $meta['title'] ?? __('meta.admin_title') }}">
        <meta property="og:description" content="{{ $meta['description'] ?? '' }}">
        <meta property="og:url" content="{{ $meta['canonical'] ?? url()->current() }}">
        <meta property="og:site_name" content="{{ $meta['site_name'] ?? ($meta['title'] ?? __('meta.admin_title')) }}">
        <meta property="og:image" content="{{ $meta['image'] ?? '' }}">
        <meta property="og:locale" content="{{ $meta['locale'] ?? 'en_US' }}">

        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $meta['title'] ?? __('meta.admin_title') }}">
        <meta name="twitter:description" content="{{ $meta['description'] ?? '' }}">
        <meta name="twitter:image" content="{{ $meta['image'] ?? '' }}">
        <meta name="twitter:site" content="{{ $meta['twitter_site'] ?? '' }}">

        <script>
            (() => {
                try {
                    const theme = localStorage.getItem('theme');
                    if (theme) document.documentElement.setAttribute('data-theme', theme);
                } catch {
                    // noop
                }
            })();
        </script>

        @viteReactRefresh
        @vite(['resources/application/dashboard/app.jsx'])
    </head>
    <body>
        <div id="dashboard"></div>
    </body>
</html>
