#!/usr/bin/env sh
set -e

cd /var/www/html

echo "Starting Laravel container..."

# temp dir
mkdir -p /tmp
chmod 1777 /tmp || true

# required directories
mkdir -p \
  storage/framework/cache \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs \
  bootstrap/cache \
  database

# sqlite db
if [ ! -f database/database.sqlite ]; then
  touch database/database.sqlite
fi

# permissions
chmod -R 775 storage bootstrap/cache database || true
chown -R www:www storage bootstrap/cache database || true

# install dependencies if needed
if [ ! -f vendor/autoload.php ]; then
  echo "Installing composer dependencies..."
  composer install --no-interaction --prefer-dist --no-progress
fi

# generate app key only if missing
if ! grep -q "^APP_KEY=base64:" .env 2>/dev/null; then
  echo "Generating APP_KEY..."
  php artisan key:generate --force || true
fi

# clear caches only (better for dev)
php artisan optimize:clear || true

exec "$@"