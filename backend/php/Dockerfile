FROM php:8.4-fpm-alpine

# Dependencias del sistema y extensiones PHP para Laravel
RUN apk add --no-cache \
    bash \
    git \
    unzip \
    icu-dev \
    oniguruma-dev \
    libzip-dev \
    mysql-client \
  && docker-php-ext-configure intl \
  && docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_mysql \
    mbstring \
    intl \
    zip \
  && rm -rf /var/cache/apk/*

# Instalar Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Límites de subida (audio, portadas...) — sobreescribe el php.ini por defecto
COPY uploads.ini /usr/local/etc/php/conf.d/zz-uploads.ini

WORKDIR /var/www

# Ajuste de permisos para Laravel
RUN chown -R www-data:www-data /var/www