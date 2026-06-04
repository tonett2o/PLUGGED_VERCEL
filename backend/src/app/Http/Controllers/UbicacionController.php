<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

/**
 * UbicacionController - Búsqueda de ubicaciones geográficas
 *
 * Controla la búsqueda de ubicaciones y coordenadas incluyendo:
 * - Búsqueda por texto usando API externa (Photon/Komoot)
 * - Caché de resultados para optimizar consultas repetidas
 * - Validación de consultas mínimas (3 caracteres)
 * - Limpieza y formateo de respuestas de la API
 * - Filtrado geográfico a España
 * - Logging de errores y respuestas
 *
 * Usa la API de Photon (https://photon.komoot.io/) que es de código abierto
 * y no requiere autenticación para búsquedas básicas.
 *
 * @package App\Http\Controllers
 */
class UbicacionController extends Controller
{
    /**
     * Busca ubicaciones por texto (búsqueda geográfica)
     *
     * Retorna un máximo de 5 resultados con coordenadas (latitud, longitud).
     * Los resultados se cachean durante 24 horas para optimizar consultas repetidas.
     *
     * Proceso:
     * 1. Obtiene y valida query de búsqueda (mínimo 3 caracteres)
     * 2. Verifica si resultado está en caché
     * 3. Si está en caché, retorna inmediatamente
     * 4. Si no, realiza solicitud HTTP a API de Photon
     * 5. Procesa respuesta y extrae coordenadas
     * 6. Cachea resultados durante 24 horas
     * 7. Retorna ubicaciones encontradas
     *
     * Validaciones:
     * - Query es requerido y debe tener mínimo 3 caracteres
     * - Búsqueda limitada a España (bounding box)
     * - Máximo 5 resultados por búsqueda
     *
     * @param Request $request Debe contener parámetro 'q' (query de búsqueda)
     * @return \Illuminate\Http\JsonResponse Array de ubicaciones encontradas
     *
     * @example
     * GET /api/ubicaciones/buscar?q=Madrid
     * Response: [{
     *   display_name: "Madrid, Spain",
     *   lat: 40.4168,
     *   lon: -3.7038
     * }, {
     *   display_name: "Alcalá de Henares, Spain",
     *   lat: 40.4842,
     *   lon: -3.3609
     * }, ...]
     *
     * @example
     * GET /api/ubicaciones/buscar?q=Ba (query < 3 caracteres)
     * Response: []
     *
     * @example
     * GET /api/ubicaciones/buscar?q=Madrid (búsqueda cacheada)
     * Response: [...] (datos del caché)
     */
    public function buscar(Request $request)
    {
        // Paso 1: Obtener y validar query
        $query = $request->input('q');

        // Validar que query existe y tiene mínimo 3 caracteres
        if (!$query || strlen($query) < 3) {
            return response()->json([]);
        }

        // Paso 2: Verificar caché
        $cacheKey = 'ubicacion_' . md5($query);

        if (Cache::has($cacheKey)) {
            return response()->json(Cache::get($cacheKey));
        }

        // Paso 3: Realizar solicitud a API externa
        try {
            $response = Http::withHeaders([
                'User-Agent' => 'Plugged Music Platform'
            ])->get('https://photon.komoot.io/api', [
                'q' => $query,
                'limit' => 5, // Máximo 5 resultados
                'bbox' => '-9.56,35.95,4.32,43.82' // Bounding box de España
            ]);

            $data = $response->json();
            \Log::info('Búsqueda de ubicación: ' . $query, ['status' => $response->status()]);

            // Paso 4: Procesar respuesta
            if ($response->status() === 200 && isset($data['features']) && is_array($data['features'])) {
                // Paso 5: Extraer y formatear coordenadas
                $features = array_map(function($feature) {
                    return [
                        'display_name' => $feature['properties']['name'] ?? '',
                        'lat' => $feature['geometry']['coordinates'][1] ?? 0,
                        'lon' => $feature['geometry']['coordinates'][0] ?? 0
                    ];
                }, $data['features']);

                // Paso 6: Cachear resultados durante 24 horas
                Cache::put($cacheKey, $features, 60 * 60 * 24);

                // Paso 7: Retornar ubicaciones
                return response()->json($features);
            }

            return response()->json([]);
        } catch (\Exception $e) {
            // Log de error
            \Log::error('Error en búsqueda de ubicación: ' . $e->getMessage());
            return response()->json([]);
        }
    }
}
