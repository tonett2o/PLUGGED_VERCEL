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

# Faker pasó de require-dev a require (lo usan los factories/seeders en producción).
# Usamos `composer update fakerphp/faker` en lugar de `composer install` para que el
# lock se regenere durante el build y Faker quede en el set de producción, manteniendo
# el resto de paquetes fijados y excluyendo las dependencias dev reales (phpunit, etc.).
RUN composer update fakerphp/faker --optimize-autoloader --no-dev --no-scripts && \
    chmod -R 755 storage bootstrap/cache && \
    php artisan storage:link

EXPOSE 8000

# El servidor built-in de PHP (php -S) es monohilo por defecto: solo atiende una
# petición a la vez. Con varios GET concurrentes al cargar la página, los demás
# fallan (ERR_FAILED). PHP_CLI_SERVER_WORKERS hace que forke varios procesos worker
# para atender peticiones en paralelo.
ENV PHP_CLI_SERVER_WORKERS=8

CMD ["php", "-S", "0.0.0.0:8000", "-t", "public/", "/var/www/router.php"]
