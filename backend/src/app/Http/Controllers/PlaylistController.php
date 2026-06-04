<?php

namespace App\Http\Controllers;

use App\Models\Playlist;
use App\Http\Requests\PlaylistRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * PlaylistController - Gestión de playlists de música
 *
 * Controla las operaciones CRUD para playlists incluyendo:
 * - Listar playlists públicas (y privadas si pertenecen al usuario)
 * - Crear nuevas playlists con metadatos y portada
 * - Actualizar datos de playlist (título, descripción, privacidad, portada)
 * - Eliminar playlists (solo si no están protegidas del sistema)
 * - Gestionar composición de playlists: agregar canciones
 * - Control de privacidad: público/privado
 * - Protección de playlists del sistema (no se pueden editar/eliminar)
 * - Cargar relaciones: usuario creador, canciones
 * - Ordenamiento automático de canciones en la playlist
 *
 * @package App\Http\Controllers
 */
class PlaylistController extends Controller
{
    /**
     * Obtiene la lista de playlists accesibles al usuario actual
     *
     * Lógica de privacidad:
     * - Cualquier usuario puede ver playlists públicas
     * - Solo el creador puede ver sus propias playlists privadas
     * - Los no autenticados solo ven playlists públicas
     *
     * Incluye:
     * - Metadata: título, artista, privacidad, fecha publicación, portada
     * - Relaciones: usuario creador, canciones en la playlist
     *
     * @return \Illuminate\Http\JsonResponse Array de playlists accesibles
     *
     * @example
     * GET /api/playlists
     * Response: [{
     *   id: 1,
     *   titulo: "Party Hits 2026",
     *   artista: "DJ Master",
     *   portada: "portadas/playlist-1.jpg",
     *   descripcion: "Best party tracks",
     *   privacidad: "publica",
     *   fecha_publicacion: "2026",
     *   usuario: {id, nick, avatar, ...},
     *   canciones: [{id, titulo, bpm, estilo, ...}, ...]
     * }, ...]
     */
    public function index()
    {
        $usuarioAutenticado = auth('sanctum')->user();

        // Cargar relaciones de forma eficiente con with()
        // NOTA: No cargar 'canciones' aquí - se cargan solo en show() para mejor rendimiento
        $playlists = Playlist::with(['usuario'])
            ->select('id', 'titulo', 'artista', 'portada', 'descripcion', 'privacidad', 'fecha_publicacion', 'id_usuario')
            ->where(function ($query) use ($usuarioAutenticado) {
                // Mostrar todas las públicas
                $query->where('privacidad', 'publica')
                    // O mostrar privadas solo del usuario autenticado
                    ->orWhere(function ($subQuery) use ($usuarioAutenticado) {
                        if ($usuarioAutenticado) {
                            $subQuery->where('privacidad', 'privada')->where('id_usuario', $usuarioAutenticado->id);
                        }
                    });
            })
            ->get();

        return response()->json($playlists, 200);
    }

    /**
     * Crea una nueva playlist en la base de datos
     *
     * Proceso:
     * 1. Valida datos usando PlaylistRequest
     * 2. Instancia playlist con datos validados
     * 3. Asigna artista automáticamente desde nick del usuario propietario
     * 4. Normaliza fecha a 4 dígitos de año
     * 5. Procesa y almacena portada en storage/public/portadas/
     * 6. Guarda playlist en base de datos
     *
     * @param PlaylistRequest $request Datos validados: titulo, descripcion, privacidad, fecha_publicacion, id_usuario, portada
     * @return \Illuminate\Http\JsonResponse Playlist creada
     *
     * @example
     * POST /api/playlists
     * Headers: Authorization: Bearer {token}
     * Body (FormData): {
     *   titulo: "Party Hits 2026",
     *   descripcion: "Best party tracks",
     *   privacidad: "publica",
     *   fecha_publicacion: "2026",
     *   id_usuario: 1,
     *   portada: <File.jpg>
     * }
     * Response: {
     *   id: 1,
     *   titulo: "Party Hits 2026",
     *   artista: "dj_master",
     *   portada: "portadas/...",
     *   descripcion: "Best party tracks",
     *   privacidad: "publica",
     *   fecha_publicacion: "2026"
     * }
     */
    public function store(PlaylistRequest $request)
    {
        // Paso 1: Obtener datos validados
        $datos = $request->validated();

        // Paso 2: Instanciar playlist con datos validados
        $playlist = new Playlist($datos);

        // Paso 3: Asignar artista automáticamente desde nick del usuario
        $usuario = \App\Models\Usuario::find($request->id_usuario);
        $playlist->artista = $usuario->nick ?? 'Artista Desconocido';

        // Paso 4: Normalizar fecha a 4 dígitos de año
        $playlist->fecha_publicacion = substr($request->fecha_publicacion, 0, 4);

        // Paso 5: Procesar y guardar portada si existe
        if ($request->hasFile('portada')) {
            $ruta = $request->file('portada')->store('portadas', 'public');
            $playlist->portada = $ruta;
        }

        // Paso 6: Guardar en base de datos
        $playlist->save();

        return response()->json($playlist, 201);
    }

    /**
     * Obtiene los detalles completos de una playlist específica
     *
     * Verifica privacidad y solo retorna la playlist si:
     * - Es pública (cualquier usuario puede verla)
     * - Es privada AND el usuario actual es el creador
     *
     * Incluye:
     * - Metadata: título, artista, privacidad, fecha publicación, portada
     * - Relaciones: usuario creador, todas las canciones en la playlist
     *
     * @param string $id ID de la playlist
     * @return \Illuminate\Http\JsonResponse Detalles de la playlist o error 403 si no tiene permiso
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si la playlist no existe
     *
     * @example
     * GET /api/playlists/1
     * Response: {
     *   id: 1,
     *   titulo: "Party Hits 2026",
     *   artista: "dj_master",
     *   portada: "portadas/playlist-1.jpg",
     *   descripcion: "Best party tracks",
     *   privacidad: "publica",
     *   fecha_publicacion: "2026",
     *   usuario: {id: 1, nick: "dj_master", avatar: "..."},
     *   canciones: [{id, titulo, bpm, estilo, ...}, ...]
     * }
     *
     * @example
     * GET /api/playlists/999 (playlist privada de otro usuario)
     * Response: { error: "No tienes permiso para ver esta playlist" } (403)
     */
    public function show(string $id)
    {
        $usuarioAutenticado = auth('sanctum')->user();

        $playlist = Playlist::with(['usuario', 'canciones'])
            ->select('id', 'titulo', 'artista', 'portada', 'descripcion', 'privacidad', 'fecha_publicacion', 'id_usuario')
            ->findOrFail($id);

        // Verificar privacidad: solo el creador puede ver sus playlists privadas
        if ($playlist->privacidad === 'privada' && (!$usuarioAutenticado || (int)$playlist->id_usuario !== (int)$usuarioAutenticado->id)) {
            return response()->json(['error' => 'No tienes permiso para ver esta playlist'], 403);
        }

        return response()->json($playlist, 200);
    }

    /**
     * Actualiza una playlist existente en la base de datos
     *
     * Permite actualizar metadata, portada y privacidad.
     * Las playlists protegidas del sistema no se pueden editar.
     *
     * Proceso:
     * 1. Obtiene playlist por ID o lanza excepción
     * 2. Verifica que no esté protegida (playlists del sistema)
     * 3. Valida datos usando PlaylistRequest
     * 4. Reemplaza portada si se proporciona:
     *    - Elimina archivo anterior del storage
     *    - Almacena nueva portada
     * 5. Actualiza datos en base de datos
     * 6. Recarga modelo para retornar datos frescos
     *
     * @param PlaylistRequest $request Datos a actualizar (validados)
     * @param string $id ID de la playlist a actualizar
     * @return \Illuminate\Http\JsonResponse Respuesta con playlist actualizada
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si la playlist no existe
     *
     * @example
     * PUT /api/playlists/1
     * Headers: Authorization: Bearer {token}
     * Body (FormData): {
     *   titulo: "Party Hits 2026 (Updated)",
     *   descripcion: "Best party tracks - Updated",
     *   privacidad: "privada",
     *   portada: <File.jpg> (opcional)
     * }
     * Response: {
     *   error: false,
     *   message: "Playlist actualizada con éxito",
     *   playlist: {id, titulo, artista, portada, descripcion, ...}
     * }
     *
     * @example
     * PUT /api/playlists/999 (playlist del sistema)
     * Response: { error: "No puedes modificar playlists del sistema" } (403)
     */
    public function update(PlaylistRequest $request, string $id)
    {
        // Log para debugging
        Log::info('Archivos recibidos en update:', $request->allFiles());
        Log::info('Datos recibidos en update:', $request->all());

        $playlist = Playlist::findOrFail($id);

        // Verificar si la playlist está protegida (del sistema)
        if ($playlist->protegida) {
            return response()->json(['error' => 'No puedes modificar playlists del sistema'], 403);
        }

        $datosValidados = $request->validated();

        // Proceso: Procesar nueva portada si se proporciona
        if ($request->hasFile('portada')) {
            // Eliminar portada anterior si existe
            if ($playlist->portada && Storage::disk('public')->exists($playlist->portada)) {
                Storage::disk('public')->delete($playlist->portada);
            }

            // Almacenar nueva portada
            $datosValidados['portada'] = $request->file('portada')->store('portadas', 'public');
        }

        // Actualizar base de datos
        $playlist->update($datosValidados);

        // Recargar modelo para retornar datos frescos
        $playlist->refresh();

        return response()->json([
            'error' => false,
            'message' => 'Playlist actualizada con éxito',
            'playlist' => $playlist
        ], 200);
    }

    /**
     * Elimina una playlist de la base de datos
     *
     * Las playlists protegidas del sistema no se pueden eliminar.
     *
     * @param string $id ID de la playlist a eliminar
     * @return \Illuminate\Http\JsonResponse Respuesta vacía con status 204 o error 403
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si la playlist no existe
     *
     * @example
     * DELETE /api/playlists/1
     * Headers: Authorization: Bearer {token}
     * Response: (empty, status 204 No Content)
     *
     * @example
     * DELETE /api/playlists/999 (playlist del sistema)
     * Response: { error: "No puedes eliminar playlists del sistema" } (403)
     */
    public function destroy(string $id)
    {
        $playlist = Playlist::findOrFail($id);

        // Verificar si la playlist está protegida (del sistema)
        if ($playlist->protegida) {
            return response()->json(['error' => 'No puedes eliminar playlists del sistema'], 403);
        }

        $playlist->delete();

        return response()->json(null, 204);
    }

    /**
     * Agrega una canción existente a una playlist
     *
     * Validaciones:
     * - Usuario debe estar autenticado
     * - Usuario debe ser propietario de la playlist
     * - Canción debe existir en base de datos
     * - Canción no debe estar ya en la playlist (evitar duplicados)
     *
     * Proceso:
     * 1. Verifica autenticación del usuario
     * 2. Obtiene playlist por ID
     * 3. Verifica que usuario es propietario de la playlist
     * 4. Valida que la canción existe
     * 5. Verifica que la canción no está ya en la playlist
     * 6. Calcula nuevo número de orden (máximo + 1)
     * 7. Adjunta canción a playlist con número de orden
     *
     * @param string $playlistId ID de la playlist
     * @param Request $request Con id_cancion: ID de la canción a agregar
     * @return \Illuminate\Http\JsonResponse Mensaje de éxito o error
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si playlist o canción no existen
     *
     * @example
     * POST /api/playlists/1/agregar-cancion
     * Headers: Authorization: Bearer {token}
     * Body: {
     *   id_cancion: 123
     * }
     * Response: {
     *   error: false,
     *   message: "Canción agregada a la playlist con éxito"
     * }
     *
     * @example
     * POST /api/playlists/1/agregar-cancion (usuario no propietario)
     * Response: {
     *   error: true,
     *   message: "No tienes permiso para modificar esta playlist"
     * } (403)
     *
     * @example
     * POST /api/playlists/1/agregar-cancion (canción ya en la playlist)
     * Response: {
     *   error: true,
     *   message: "La canción ya está en la playlist"
     * } (400)
     */
    public function agregarCancion(string $playlistId, Request $request)
    {
        $usuarioAutenticado = auth('sanctum')->user();

        // Paso 1: Verificar autenticación
        if (!$usuarioAutenticado) {
            return response()->json(['error' => true, 'message' => 'No autenticado'], 401);
        }

        // Paso 2: Obtener playlist
        $playlist = Playlist::findOrFail($playlistId);

        // Paso 3: Verificar que usuario es propietario de la playlist
        if ((int)$playlist->id_usuario !== (int)$usuarioAutenticado->id) {
            return response()->json(['error' => true, 'message' => 'No tienes permiso para modificar esta playlist'], 403);
        }

        // Paso 4: Validar que la canción existe
        $idCancion = $request->input('id_cancion');
        $cancion = \App\Models\Cancion::findOrFail($idCancion);

        // Paso 5: Verificar que la canción no está ya en la playlist
        if ($playlist->canciones()->where('id_cancion', $idCancion)->exists()) {
            return response()->json(['error' => true, 'message' => 'La canción ya está en la playlist'], 400);
        }

        // Paso 6: Calcular nuevo número de orden
        $maxOrden = (int)($playlist->canciones()->max('cancion_playlist.orden') ?? 0);

        // Paso 7: Adjuntar canción a playlist con orden
        $playlist->canciones()->attach($idCancion, [
            'orden' => $maxOrden + 1
        ]);

        return response()->json([
            'error' => false,
            'message' => 'Canción agregada a la playlist con éxito'
        ], 200);
    }
}