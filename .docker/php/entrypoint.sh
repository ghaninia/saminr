#!/usr/bin/env sh
set -e

cd /var/www/html

# Ensure needed directories exist and are writable
mkdir -p storage/framework/{cache,sessions,views} bootstrap/cache
chmod -R 775 storage bootstrap/cache || true

# Install dependencies if missing
if [ ! -f vendor/autoload.php ]; then
  composer install --no-interaction --prefer-dist --no-progress
fi

# Generate app key if missing
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "" ]; then
  php artisan key:generate --force || true
fi

# Clear and cache configurations for better performance
php artisan config:clear || true
php artisan config:cache || true

# Cache routes for better performance
php artisan route:cache || true

# Optimize autoloader
composer dump-autoload --optimize || true

exec "$@"
