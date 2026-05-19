FROM php:8.3-fpm-alpine AS base

RUN apk add --no-cache --virtual .build-deps \
    $PHPIZE_DEPS \
    icu-dev \
    libzip-dev \
    oniguruma-dev \
    libpng-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    zlib-dev \
    postgresql-dev \
    bash \
    curl \
    git \
    openssh-client \
  && apk add --no-cache \
    libzip \
    libpng \
    libjpeg-turbo \
    freetype \
    zlib \
    supervisor \
    postgresql-libs \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install -j$(nproc) \
    bcmath \
    pcntl \
    pdo_pgsql \
    gd \
    zip \
    opcache \
    exif \
  && pecl install redis \
  && docker-php-ext-enable redis \
  && apk del .build-deps \
  && rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /var/www/html
COPY .docker/php/php.ini /usr/local/etc/php/conf.d/docker-php.ini

FROM base AS vendor-dev
COPY --from=base /usr/local/bin/composer /usr/local/bin/composer
WORKDIR /var/www/html
COPY composer.json composer.lock artisan ./
COPY bootstrap /var/www/html/bootstrap/
RUN composer install --prefer-dist --no-progress --no-interaction --optimize-autoloader

FROM base AS vendor-prod
COPY --from=base /usr/local/bin/composer /usr/local/bin/composer
WORKDIR /var/www/html
COPY composer.json composer.lock artisan ./
COPY bootstrap /var/www/html/bootstrap/
RUN composer install --prefer-dist --no-dev --no-progress --no-interaction --optimize-autoloader --classmap-authoritative

FROM base AS dev
COPY --from=vendor-dev /var/www/html/vendor /var/www/html/vendor
COPY . /var/www/html
COPY .docker/php/entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY .docker/supervisor/supervisord.conf /etc/supervisor/supervisord.conf
COPY .docker/supervisor/*.conf /etc/supervisor/conf.d/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
 && mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache \
 && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
EXPOSE 9000
USER www-data:www-data
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["php-fpm"]

FROM base AS prod
COPY --from=vendor-prod /var/www/html/vendor /var/www/html/vendor
COPY . /var/www/html
COPY .docker/php/entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY .docker/supervisor/supervisord.conf /etc/supervisor/supervisord.conf
COPY .docker/supervisor/*.conf /etc/supervisor/conf.d/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
 && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
EXPOSE 9000
USER www-data:www-data
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["php-fpm"]
