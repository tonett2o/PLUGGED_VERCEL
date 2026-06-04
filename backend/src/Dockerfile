FROM php:8.4-cli-alpine

# Dependencias del sistema (zip, intl, etc.) + herramientas + Apache
RUN apk add --no-cache \
    bash \
    git \
    unzip \
    icu-dev \
    oniguruma-dev \
    libzip-dev \
    mysql-client \
    apache2 \
    apache2-mod-php \
  && docker-php-ext-configure intl \
  && docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_mysql \
    mbstring \
    intl \
    zip \
  && rm -rf /var/cache/apk/*

# Composer (copiado desde la imagen oficial)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copiar todos los archivos del proyecto
COPY . .

# Instalar dependencias de composer
RUN composer install --optimize-autoloader --no-dev

# Permisos para storage y bootstrap
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Configurar Apache para Laravel
RUN echo '<Directory /var/www/html/public>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' > /etc/apache2/conf-available/laravel.conf && \
    a2enconf laravel

# Configurar DocumentRoot
RUN sed -i 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

EXPOSE 80

CMD ["apache2-foreground"]
