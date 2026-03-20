# syntax=docker/dockerfile:1
FROM php:8.2-fpm-alpine

# System dependencies
RUN apk add --no-cache \
    bash git curl zip unzip \
    libzip-dev icu-dev oniguruma-dev zlib-dev \
    libpng-dev libjpeg-turbo-dev freetype-dev \
    openssl-dev autoconf g++ make shadow sqlite-dev

# PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j"$(nproc)" \
    pdo pdo_sqlite bcmath gd intl opcache

# Redis PHP extension
RUN pecl install redis \
 && docker-php-ext-enable redis

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Create non-root user (www)
RUN addgroup -S www && adduser -S -G www www

WORKDIR /var/www/html

# Optimize PHP-FPM for dev defaults
COPY <<'PHP_INI' /usr/local/etc/php/conf.d/dev.ini
memory_limit=512M
post_max_size=64M
upload_max_filesize=64M
max_execution_time=120
opcache.enable=1
opcache.validate_timestamps=1
opcache.revalidate_freq=1
PHP_INI

# Copy entrypoint script
COPY .docker/php/entrypoint.sh /usr/local/bin/app-entrypoint.sh
RUN chmod +x /usr/local/bin/app-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/app-entrypoint.sh"]

# Default command
CMD ["php-fpm", "-F"]
