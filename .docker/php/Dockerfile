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
    pdo pdo_sqlite bcmath gd intl opcache exif

# Redis extension
RUN pecl install redis \
 && docker-php-ext-enable redis

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Create user
RUN addgroup -S www && adduser -S -G www www

WORKDIR /var/www/html

# Temp directory fix (important for Windows)
RUN mkdir -p /tmp \
    && chmod 1777 /tmp

# Laravel writable dirs
RUN mkdir -p \
    /var/www/html/storage \
    /var/www/html/bootstrap/cache \
    /var/www/html/vendor \
    && chown -R www:www /var/www/html \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# PHP config
COPY <<'PHP_INI' /usr/local/etc/php/conf.d/dev.ini
memory_limit=512M
post_max_size=64M
upload_max_filesize=64M
max_execution_time=120
sys_temp_dir=/tmp
upload_tmp_dir=/tmp
opcache.enable=1
opcache.validate_timestamps=1
opcache.revalidate_freq=1
PHP_INI

# Entrypoint
COPY .docker/php/entrypoint.sh /usr/local/bin/app-entrypoint.sh
RUN chmod +x /usr/local/bin/app-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/app-entrypoint.sh"]

CMD ["php-fpm", "-F"]