<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Dashboard JWT Secret
    |--------------------------------------------------------------------------
    |
    | Used to sign and verify dashboard JWT tokens.
    | In production you should set DASHBOARD_JWT_SECRET to a long random value.
    |
    */
    'secret' => env('DASHBOARD_JWT_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Token Lifetime (minutes)
    |--------------------------------------------------------------------------
    */
    'ttl_minutes' => (int) env('DASHBOARD_JWT_TTL_MINUTES', 60 * 24 * 7),

    /*
    |--------------------------------------------------------------------------
    | Cookie name
    |--------------------------------------------------------------------------
    */
    'cookie' => env('DASHBOARD_JWT_COOKIE', 'dashboard_token'),
];

