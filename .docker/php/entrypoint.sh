#!/bin/sh
set -e

cd /var/www/html

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
fi

# Make storage and cache writable by the application user.
mkdir -p storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R 755 storage bootstrap/cache

if [ "$APP_ENV" = "production" ] || [ "$APP_ENV" = "prod" ]; then
  if [ -f artisan ]; then
    php artisan key:generate --force || true
    php artisan storage:link --force || true
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
  fi
fi

exec "$@"
