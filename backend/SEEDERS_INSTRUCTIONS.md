# Instrucciones para Ejecutar Seeders

## En Desarrollo Local (Linux/macOS)
```bash
cd backend/src
php artisan migrate:fresh --seed
```

## En Railway (Producción)

### Opción 1: Via Railway CLI
```bash
railway run php artisan migrate:fresh --seed
```

### Opción 2: Via Railway Dashboard
1. Ve a tu proyecto en railway.app
2. Abre la terminal (CLI) del servicio backend
3. Ejecuta:
```bash
php artisan migrate:fresh --seed
```

## Qué hace el Seeder

El DatabaseSeeder ejecuta los siguientes seeders en orden:

1. **CancionPorDefectoSeeder** - Crea una canción por defecto
   - Usuario "Sistema"
   - Título: "Default Track"
   - Audio: `audios/1QECXGjby1ICwbeV2mxsdVi5kdM0EXl5iFCBLHO2.mp3`

2. **EquipamientoRealSeeder** - Equipamiento (hardware/software) real
   - DAWs: Ableton, Logic Pro, FL Studio
   - Síntesis: Serum, Massive X, Sylenth1
   - Efectos: Omnisphere, Nexus, Maschine

3. **EstilosSeeder** - Géneros musicales
   - Techno, House, Deep House, Trance, Drum & Bass, Electro, etc.

4. **15 Productores Europeos** - Con:
   - Equipamiento específico según género
   - Géneros primarios coherentes
   - Colecciones (Singles, Me gusta protegidas)
   - Playlists

5. **Eventos Reales** - Desde venues europeos reales
   - EventosSeeder: festivales, clubs

6. **Contenido Generado**
   - Colecciones y canciones por productor (4-6 canciones/colección)
   - Géneros sincronizados con productor
   - Likes realistas (70% misma escena, 30% otros)
   - Comentarios específicos por género
   - Redes de seguimiento dentro de escenas

7. **Datos Finales**
   - ReproduccionesSeeder: histórico realista de plays
   - GaleriaSeeder: imágenes de galería temáticas

## Audios Disponibles para Canciones

El CancionFactory usa estos audios reales:
- `audios/1QECXGjby1ICwbeV2mxsdVi5kdM0EXl5iFCBLHO2.mp3` (5.7 MB)
- `audios/28oY3tWZoMLBNnIVCVxRayON9FggTRO3xIbLrLM0.mp3` (14 MB)
- `audios/2HhdHagZjcOPL5Gr1DxiE7SiUzbOkW2RUiArBQ85.mp3` (4.9 MB)
- `audios/35hUFrgKW67CaDwxpXnHOJlqTi6vuU5WHg61zmsa.mp3` (4.9 MB)
- `audios/3a0dtwy6ZOr5PqAlafXKyZi6kWrvyDVzEPsnNWiS.mp3` (4.9 MB)

Y muchos más en storage/app/public/audios/

## Tiempo de Ejecución

El seeder completo toma aproximadamente:
- **Desarrollo local**: 30-60 segundos
- **Railway**: 1-2 minutos (según carga del servidor)

## Limpiar la BD y Volver a Seedear

```bash
php artisan migrate:fresh --seed
```

Este comando:
1. Revierte todas las migraciones
2. Ejecuta todas las migraciones nuevamente
3. Ejecuta todos los seeders

⚠️ **ADVERTENCIA**: Esto borra TODOS los datos. Úsalo solo en desarrollo.

## Ejecutar Solo un Seeder

```bash
php artisan db:seed --class=CancionPorDefectoSeeder
php artisan db:seed --class=EstilosSeeder
php artisan db:seed --class=EventosSeeder
```

## Resultados Esperados

Después de ejecutar `migrate:fresh --seed`, la BD tendrá:
- ✅ 15 productores europeos
- ✅ ~60-90 canciones (4-6 por colección × 2-3 colecciones/usuario)
- ✅ ~30 colecciones con colaboraciones
- ✅ ~30 playlists
- ✅ ~40-50 eventos desde venues reales
- ✅ Histórico de reproducciones
- ✅ Imágenes de galería temáticas
- ✅ Redes sociales (likes, comentarios, seguimientos)
- ✅ 1 canción por defecto (Sistema/Default Track)
