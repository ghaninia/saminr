<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ config('app.name', 'Samin') }}</title>
        @viteReactRefresh
        @vite(['resources/application/app.jsx'])
    </head>
    <body>
        <div id="app"></div>
    </body>
</html>
