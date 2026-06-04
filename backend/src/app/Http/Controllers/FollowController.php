<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;

/**
 * FollowController - Gestión de relaciones de seguimiento entre usuarios
 *
 * Controla las operaciones de follow incluyendo:
 * - Alternar follow/unfollow (seguir/dejar de seguir)
 * - Validar que no se siga a sí mismo
 * - Mantener relaciones many-to-many de seguimiento
 * - Retornar estado actual de seguimiento
 *
 * @package App\Http\Controllers
 */
class FollowController extends Controller
{
    /**
     * Alterna el estado de seguimiento entre el usuario autenticado y otro usuario
     *
     * Si el usuario autenticado ya sigue al usuario objetivo, lo desigue.
     * Si no lo sigue, comienza a seguirlo.
     *
     * Validaciones:
     * - Usuario objetivo debe existir
     * - No se puede seguir a sí mismo
     * - Se utiliza relación many-to-many para almacenar seguimientos
     *
     * Proceso:
     * 1. Obtiene usuario autenticado (seguidor)
     * 2. Verifica que usuario a seguir existe
     * 3. Valida que no intenta seguirse a sí mismo
     * 4. Comprueba si ya existe relación de seguimiento
     * 5. Si existe: rompe la relación (detach/unfollow)
     * 6. Si no existe: crea la relación (attach/follow)
     * 7. Retorna estado actual y mensaje descriptivo
     *
     * @param int $idSeguido ID del usuario a seguir/dejar de seguir
     * @return JsonResponse Con following (boolean) y mensaje descriptivo
     *
     * @example
     * POST /api/usuarios/5/toggle-follow
     * Headers: Authorization: Bearer {token}
     * Response (nuevo seguimiento): {
     *   message: "Ahora sigues a este usuario",
     *   following: true
     * }
     *
     * @example
     * POST /api/usuarios/5/toggle-follow (llamada nuevamente)
     * Headers: Authorization: Bearer {token}
     * Response (dejar de seguir): {
     *   message: "Has dejado de seguir",
     *   following: false
     * }
     *
     * @example
     * POST /api/usuarios/1/toggle-follow (intentar seguirse a sí mismo)
     * Headers: Authorization: Bearer {token}
     * Response: { message: "No puedes seguirte a ti mismo" } (400)
     *
     * @example
     * POST /api/usuarios/999/toggle-follow (usuario no existe)
     * Response: { message: "Usuario no encontrado" } (404)
     */
    public function toggleFollow(int $idSeguido): JsonResponse
    {
        // Paso 1: Obtener usuario autenticado (seguidor)
        /** @var Usuario $seguidor */
        $seguidor = Auth::user();

        // Paso 2: Verificar que el usuario a seguir existe
        $usuarioAseguir = Usuario::find($idSeguido);
        if (!$usuarioAseguir) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        // Paso 3: Validar que no intenta seguirse a sí mismo
        if ((int)$seguidor->id === (int)$idSeguido) {
            return response()->json(['message' => 'No puedes seguirte a ti mismo'], 400);
        }

        // Paso 4: Comprobar si ya existe relación de seguimiento
        $yaSigue = $seguidor->seguidos()->where('id_seguido', $idSeguido)->exists();

        // Paso 5 & 6: Alternar relación
        if ($yaSigue) {
            // Si ya sigue, romper la relación
            $seguidor->seguidos()->detach($idSeguido);
            $following = false;
        } else {
            // Si no sigue, crear la relación
            $seguidor->seguidos()->attach($idSeguido);
            $following = true;
        }

        // Paso 7: Retornar estado actual
        return response()->json([
            'message' => $following ? 'Ahora sigues a este usuario' : 'Has dejado de seguir',
            'following' => $following
        ]);
    }
}