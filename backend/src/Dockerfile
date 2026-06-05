FROM php:8.3-cli-alpine

RUN apk add --no-cache \
    bash \
    git \
    unzip \
    icu-dev \
    oniguruma-dev \
    libzip-dev \
  && docker-php-ext-configure intl \
  && docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_mysql \
    mbstring \
    intl \
    zip \
  && rm -rf /var/cache/apk/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

COPY php.ini /usr/local/etc/php/conf.d/custom.ini

RUN composer install --optimize-autoloader --no-dev --no-scripts && \
    chmod -R 755 storage bootstrap/cache && \
    php artisan storage:link

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000", "-t", "public/"]
