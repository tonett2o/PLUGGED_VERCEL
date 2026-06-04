FROM php:8.3-apache

# Instalar extensiones PHP necesarias
RUN apt-get update && apt-get install -y \
    libicu-dev \
    libonig-dev \
    libzip-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-install -j$(nproc) pdo pdo_mysql mbstring intl zip \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# Copiar composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Copiar archivos del proyecto
COPY . .

# Instalar dependencias (sin ejecutar scripts)
RUN composer install --no-interaction --optimize-autoloader --no-dev --no-scripts

# Permisos
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Configurar Apache
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|' /etc/apache2/sites-available/000-default.conf && \
    echo '<Directory /var/www/html/public>\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' >> /etc/apache2/sites-available/000-default.conf

EXPOSE 80

CMD ["apache2-foreground"]
