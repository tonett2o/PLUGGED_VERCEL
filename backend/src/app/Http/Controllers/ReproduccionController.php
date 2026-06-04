<?php

namespace App\Http\Controllers;

use App\Models\Cancion;
use App\Models\Reproduccion;
use Illuminate\Http\JsonResponse;

/**
 * ReproduccionController - Registro de reproducciones de canciones
 *
 * Controla el registro de cada vez que una canción se reproduce incluyendo:
 * - Registrar reproducción con usuario autenticado (si existe)
 * - Registrar reproducción anónima (sin usuario)
 * - Contar reproducciones totales por canción
 * - Usar para ranking de usuarios populares y estadísticas de escucha
 *
 * Las reproducciones se atribuyen al usuario si se proporciona token válido,
 * de lo contrario se registran como anónimas (id_usuario = null).
 *
 * @package App\Http\Controllers
 */
class ReproduccionController extends Controller
{
    /**
     * Registra una nueva reproducción de una canción
     *
     * Crea un registro de reproducción que se atribuye al usuario autenticado
     * si existe, de lo contrario se registra como reproducción anónima.
     *
     * Proceso:
     * 1. Verifica que la canción existe en base de datos
     * 2. Obtiene usuario autenticado (null si no hay token válido)
     * 3. Crea registro de reproducción (con usuario o anónimo)
     * 4. Retorna contador actualizado de reproducciones totales
     *
     * @param int $idCancion ID de la canción que se reproduce
     * @return JsonResponse Con reproducciones_count (contador actualizado)
     *
     * @example
     * POST /api/canciones/1/reproduccion
     * Headers: Authorization: Bearer {token} (opcional)
     * Response: {
     *   reproducciones_count: 345
     * }
     *
     * @example
     * POST /api/canciones/999/reproduccion (canción no existe)
     * Response: { message: "Canción no encontrada" } (404)
     */
    public function store(int $idCancion): JsonResponse
    {
        // Paso 1: Verificar que la canción existe
        $cancion = Cancion::find($idCancion);
        if (!$cancion) {
            return response()->json(['message' => 'Canción no encontrada'], 404);
        }

        // Paso 2: Obtener usuario autenticado (null si no hay token válido)
        $usuario = auth('sanctum')->user();

        // Paso 3: Crear registro de reproducción
        Reproduccion::create([
            'id_cancion' => $idCancion,
            'id_usuario' => $usuario?->id, // null si no autenticado
        ]);

        // Paso 4: Retornar contador actualizado
        return response()->json([
            'reproducciones_count' => $cancion->reproducciones()->count(),
        ], 201);
    }
}
