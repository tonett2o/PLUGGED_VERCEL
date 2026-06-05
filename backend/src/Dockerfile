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

# 1) Instalar dependencias PHP primero, en su propia capa.
#    Faker está en `require` (lo usan factories/seeders en producción), por eso se
#    instala incluso con --no-dev. Copiar solo composer.json aquí hace que esta capa
#    se reconstruya cuando cambian las dependencias e invalida la cache de composer.
COPY composer.json ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# 2) Copiar el resto del código (vendor está en .gitignore/.railwayignore, no se pisa).
COPY . .

COPY php.ini /usr/local/etc/php/conf.d/custom.ini

# 3) Generar el autoloader optimizado ya con el código presente, permisos y storage link.
RUN composer dump-autoload --optimize --no-scripts && \
    chmod -R 755 storage bootstrap/cache && \
    php artisan storage:link

EXPOSE 8000

# El servidor built-in de PHP (php -S) es monohilo por defecto: solo atiende una
# petición a la vez. Con varios GET concurrentes al cargar la página, los demás
# fallan (ERR_FAILED). PHP_CLI_SERVER_WORKERS hace que forke varios procesos worker
# para atender peticiones en paralelo.
ENV PHP_CLI_SERVER_WORKERS=8

CMD ["php", "-S", "0.0.0.0:8000", "-t", "public/", "/var/www/router.php"]
