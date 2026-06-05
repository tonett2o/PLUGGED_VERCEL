#!/bin/bash
# Script para ejecutar seeders facilmente

echo "🌱 Ejecutando seeders de PLUGGED..."
echo ""

# Migrar y seedear
echo "📋 Migrando base de datos y ejecutando seeders..."
php artisan migrate:fresh --seed --force

echo ""
echo "✅ ¡Seeders ejecutados correctamente!"
echo ""
echo "📊 Resultados esperados:"
echo "   - 15 productores europeos"
echo "   - ~60-90 canciones"
echo "   - ~30 colecciones con colaboraciones"
echo "   - ~30 playlists"
echo "   - ~40-50 eventos"
echo "   - 1 canción por defecto (Sistema/Default Track)"
echo ""
echo "🎵 Para usar la canción por defecto en colecciones/playlists vacías,"
echo "   asegúrate de que apunten a id_cancion NULL o a la canción 'Default Track'"
