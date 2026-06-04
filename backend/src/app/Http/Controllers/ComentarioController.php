<?php

namespace App\Http\Controllers;

use App\Models\Cancion;
use App\Models\Usuario;
use App\Http\Requests\ComentarioRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * ComentarioController - Gestión de comentarios en canciones
 *
 * Controla las operaciones de comentarios incluyendo:
 * - Listar comentarios de una canción ordenados por timestamp (segundo)
 * - Crear nuevos comentarios con timestamps (para comentarios sincronizados con la reproducción)
 * - Eliminar comentarios (solo el autor puede eliminarlos)
 * - Incluir datos del autor en las respuestas
 *
 * NOTA: Este controlador usa DB::table() en lugar de modelos Eloquent.
 * Puede refactorizarse para usar relaciones Eloquent en futuras mejoras.
 *
 * @package App\Http\Controllers
 */
class ComentarioController extends Controller
{
    /**
     * Lista todos los comentarios de una canción específica
     *
     * Retorna los comentarios ordenados por timestamp (segundo) en orden ascendente.
     * Cada comentario incluye datos básicos del autor (nick y avatar).
     *
     * Proceso:
     * 1. Verifica que la canción existe
     * 2. Realiza un join manual entre comentarios y usuarios
     * 3. Filtra por canción específica
     * 4. Ordena por timestamp (segundo) ascendente
     * 5. Selecciona campos relevantes
     *
     * @param int $idCancion ID de la canción
     * @return JsonResponse Array de comentarios ordenados por timestamp
     *
     * @example
     * GET /api/canciones/1/comentarios
     * Response: [{
     *   id: 1,
     *   texto: "Great song!",
     *   segundo: 15,
     *   created_at: "2026-05-27T10:30:00Z",
     *   id_usuario: 2,
     *   usuario_nick: "music_lover",
     *   usuario_avatar: "avatars/..."
     * }, ...]
     *
     * @example
     * GET /api/canciones/999/comentarios (canción no existe)
     * Response: { message: "Canción no encontrada" } (404)
     */
    public function index(int $idCancion): JsonResponse
    {
        // Paso 1: Verificar que la canción existe
        $cancion = Cancion::find($idCancion);
        if (!$cancion) {
            return response()->json(['message' => 'Canción no encontrada'], 404);
        }

        // Paso 2: Obtener comentarios con join a usuarios
        $comentarios = DB::table('comentarios')
            ->join('usuarios', 'comentarios.id_usuario', '=', 'usuarios.id')
            ->where('comentarios.id_cancion', $idCancion)
            ->orderBy('comentarios.segundo', 'asc') // Ordenar por timestamp de comentario
            ->select(
                'comentarios.id',
                'comentarios.texto',
                'comentarios.segundo',
                'comentarios.created_at',
                'comentarios.id_usuario',
                'usuarios.nick as usuario_nick',
                'usuarios.avatar as usuario_avatar'
            )
            ->get();

        return response()->json($comentarios, 200);
    }

    /**
     * Crea un nuevo comentario en una canción específica
     *
     * Permite a usuarios autenticados crear comentarios con timestamps sincronizados
     * con el reproductor de audio (para comentarios en momentos específicos de la canción).
     *
     * Proceso:
     * 1. Obtiene usuario autenticado
     * 2. Verifica que la canción existe
     * 3. Valida datos del comentario usando ComentarioRequest
     * 4. Inserta comentario en base de datos
     * 5. Recupera comentario creado con datos del autor
     * 6. Retorna comentario creado
     *
     * @param ComentarioRequest $request Datos validados: texto, segundo (timestamp en segundos)
     * @param int $idCancion ID de la canción
     * @return JsonResponse Comentario creado con datos del autor
     *
     * @example
     * POST /api/canciones/1/comentarios
     * Headers: Authorization: Bearer {token}
     * Body: {
     *   texto: "Great song!",
     *   segundo: 15
     * }
     * Response: {
     *   mensaje: "Comentario publicado",
     *   comentario: {
     *     id: 1,
     *     texto: "Great song!",
     *     segundo: 15,
     *     created_at: "2026-05-27T10:30:00Z",
     *     id_usuario: 2,
     *     usuario_nick: "music_lover",
     *     usuario_avatar: "avatars/..."
     *   }
     * }
     *
     * @example
     * POST /api/canciones/999/comentarios (canción no existe)
     * Response: { message: "Canción no encontrada" } (404)
     */
    public function store(ComentarioRequest $request, int $idCancion): JsonResponse
    {
        // Paso 1: Obtener usuario autenticado
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        // Paso 2: Verificar que la canción existe
        $cancion = Cancion::find($idCancion);
        if (!$cancion) {
            return response()->json(['message' => 'Canción no encontrada'], 404);
        }

        // Paso 3: Obtener datos validados
        $datos = $request->validated();

        // Paso 4: Insertar comentario en base de datos
        $idComentario = DB::table('comentarios')->insertGetId([
            'id_cancion' => $idCancion,
            'id_usuario' => $usuario->id,
            'texto'      => $datos['texto'],
            'segundo'    => $datos['segundo'], // Timestamp sincronizado con reproducción
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Paso 5: Recuperar comentario creado con datos del autor
        $comentario = DB::table('comentarios')
            ->join('usuarios', 'comentarios.id_usuario', '=', 'usuarios.id')
            ->where('comentarios.id', $idComentario)
            ->select(
                'comentarios.id',
                'comentarios.texto',
                'comentarios.segundo',
                'comentarios.created_at',
                'comentarios.id_usuario',
                'usuarios.nick as usuario_nick',
                'usuarios.avatar as usuario_avatar'
            )
            ->first();

        // Paso 6: Retornar comentario creado
        return response()->json([
            'mensaje'    => 'Comentario publicado',
            'comentario' => $comentario,
        ], 201);
    }

    /**
     * Elimina un comentario de una canción
     *
     * Solo el autor del comentario o un administrador pueden eliminarlo.
     * Valida que el usuario autenticado es el propietario del comentario.
     *
     * Proceso:
     * 1. Obtiene usuario autenticado
     * 2. Busca el comentario por ID
     * 3. Verifica que comentario existe
     * 4. Valida que usuario es el autor del comentario
     * 5. Elimina comentario de base de datos
     * 6. Retorna mensaje de confirmación
     *
     * @param int $idComentario ID del comentario a eliminar
     * @return JsonResponse Mensaje de confirmación o error
     *
     * @example
     * DELETE /api/comentarios/1
     * Headers: Authorization: Bearer {token}
     * Response: { mensaje: "Comentario eliminado" }
     *
     * @example
     * DELETE /api/comentarios/999 (comentario no existe)
     * Response: { message: "Comentario no encontrado" } (404)
     *
     * @example
     * DELETE /api/comentarios/1 (usuario no es el autor)
     * Response: { message: "No puedes borrar comentarios de otros usuarios" } (403)
     */
    public function destroy(int $idComentario): JsonResponse
    {
        // Paso 1: Obtener usuario autenticado
        /** @var Usuario $usuario */
        $usuario = Auth::user();

        // Paso 2: Buscar comentario por ID
        $comentario = DB::table('comentarios')->where('id', $idComentario)->first();

        // Paso 3: Verificar que comentario existe
        if (!$comentario) {
            return response()->json(['message' => 'Comentario no encontrado'], 404);
        }

        // Paso 4: Validar que usuario es el autor
        if ((int) $comentario->id_usuario !== (int) $usuario->id) {
            return response()->json(['message' => 'No puedes borrar comentarios de otros usuarios'], 403);
        }

        // Paso 5: Eliminar comentario
        DB::table('comentarios')->where('id', $idComentario)->delete();

        // Paso 6: Retornar confirmación
        return response()->json(['mensaje' => 'Comentario eliminado'], 200);
    }
}
