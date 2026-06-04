<?php

namespace App\Http\Controllers;

use App\Models\Cancion;
use App\Models\Usuario;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\JsonResponse;

/**
 * LikeController - Gestión de likes/favoritos en canciones
 *
 * Controla las operaciones de like incluyendo:
 * - Toggle (alternar) like/unlike en canciones
 * - Sincronización automática con playlist "Me gusta" del usuario
 * - Contar total de likes por canción
 * - Manejo de relaciones many-to-many entre usuarios y canciones liked
 *
 * @package App\Http\Controllers
 */
class LikeController extends Controller
{
    /**
     * Alterna el estado de like (like/unlike) de una canción para el usuario autenticado
     *
     * Proceso:
     * 1. Obtiene usuario autenticado
     * 2. Verifica que la canción existe
     * 3. Comprueba si el usuario ya ha dado like a la canción
     * 4. Si ya tiene like: quita like y lo remove de playlist "Me gusta"
     * 5. Si no tiene like: agrega like y lo añade a playlist "Me gusta" con orden
     * 6. Cuenta total de likes actuales de la canción
     * 7. Retorna estado del like y contador total
     *
     * La playlist "Me gusta" se actualiza automáticamente:
     * - Al añadir like: inserta canción al final de la playlist
     * - Al quitar like: elimina canción de la playlist
     *
     * @param int $idCancion ID de la canción a dar/quitar like
     * @return JsonResponse Con liked (boolean) y likes_count (integer)
     *
     * @example
     * POST /api/canciones/123/toggle-like
     * Headers: Authorization: Bearer {token}
     * Response (si aún no tenía like): {
     *   liked: true,
     *   likes_count: 128
     * }
     *
     * @example
     * POST /api/canciones/123/toggle-like (llamada nuevamente)
     * Headers: Authorization: Bearer {token}
     * Response (quitando el like): {
     *   liked: false,
     *   likes_count: 127
     * }
     *
     * @example
     * POST /api/canciones/999/toggle-like (canción no existe)
     * Response: { message: "Canción no encontrada" } (404)
     */
    public function toggle(int $idCancion): JsonResponse
    {
        // Paso 1: Obtener usuario autenticado
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        // Paso 2: Verificar que la canción existe
        $cancion = Cancion::find($idCancion);
        if (!$cancion) {
            return response()->json(['message' => 'Canción no encontrada'], 404);
        }

        // Paso 3: Comprobar si el usuario ya ha dado like a esta canción
        $yaTieneLike = $usuario->canciones_liked()
            ->where('id_cancion', $idCancion)
            ->exists();

        // Obtener la playlist "Me gusta" del usuario (creada automáticamente al registrarse)
        $playlistMeGusta = $usuario->playlists()
            ->where('titulo', 'Me gusta')
            ->first();

        // Paso 4: Si ya tiene like, removelo; Si no, agregalo
        if ($yaTieneLike) {
            // Paso 4a: Quitar el like (detach de la relación many-to-many)
            $usuario->canciones_liked()->detach($idCancion);
            $liked = false;

            // Paso 4b: Quitar también de la playlist "Me gusta" si existe
            if ($playlistMeGusta) {
                $playlistMeGusta->canciones()->detach($idCancion);
            }
        } else {
            // Paso 4c: Añadir like (attach a la relación many-to-many)
            $usuario->canciones_liked()->attach($idCancion);
            $liked = true;

            // Paso 4d: Agregar a la playlist "Me gusta" con número de orden
            if ($playlistMeGusta) {
                // Calcular el siguiente número de orden (máximo + 1)
                $maxOrden = $playlistMeGusta->canciones()
                    ->max('cancion_playlist.orden') ?? 0;

                // Adjuntar canción a playlist con el nuevo orden
                $playlistMeGusta->canciones()->attach($idCancion, [
                    'orden' => (int)$maxOrden + 1
                ]);
            }
        }

        // Paso 5: Contar el total de likes actuales de la canción
        $likesCount = $cancion->likes()->count();

        // Paso 6: Retornar estado y contador
        return response()->json([
            'liked'       => $liked,
            'likes_count' => $likesCount,
        ]);
    }
}
