#!/bin/bash
set -e

# Install dependencies
composer install --optimize-autoloader --no-dev

# Generate app key if needed
php artisan key:generate --force

# Run migrations
php artisan migrate --force

# Start the application
php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
