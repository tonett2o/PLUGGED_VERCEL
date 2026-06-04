<?php

namespace App\Http\Controllers;

use App\Models\Coleccion;
use App\Http\Requests\ColeccionRequest;
use Illuminate\Http\Request;

/**
 * ColeccionController - Gestión de colecciones de música (álbumes, EPs)
 *
 * Controla las operaciones CRUD para colecciones incluyendo:
 * - Listar colecciones públicas (y privadas si pertenecen al usuario)
 * - Crear nuevas colecciones con metadatos (título, artista, tipo, privacidad)
 * - Procesar uploads de portada de colección
 * - Cargar relaciones: usuario creador, canciones, colaboradores
 * - Actualizar metadatos, portada y colaboradores
 * - Eliminar colecciones (solo si no están protegidas del sistema)
 * - Sincronizar colaboradores con deduplicación automática
 * - Tipos de colección: álbum (album), EP (ep)
 * - Control de privacidad: público/privado
 * - Protección de colecciones del sistema (no se pueden editar/eliminar)
 *
 * @package App\Http\Controllers
 */
class ColeccionController extends Controller
{
    /**
     * Obtiene la lista de colecciones accesibles al usuario actual
     *
     * Lógica de privacidad:
     * - Cualquier usuario puede ver colecciones públicas
     * - Solo el creador puede ver sus propias colecciones privadas
     * - Los no autenticados solo ven colecciones públicas
     *
     * Incluye:
     * - Metadata: título, artista, tipo (álbum/EP), privacidad, fecha publicación
     * - Relaciones: usuario creador, canciones en la colección, colaboradores
     *
     * @return \Illuminate\Http\JsonResponse Array de colecciones accesibles
     *
     * @example
     * GET /api/colecciones
     * Response: [{
     *   id: 1,
     *   titulo: "Summer Vibes 2026",
     *   artista: "DJ Master",
     *   portada: "portadas/coleccion-1.jpg",
     *   descripcion: "Best house tracks of summer",
     *   privacidad: "publica",
     *   tipo: "album",
     *   fecha_publicacion: "2026",
     *   usuario: {id, nick, avatar, ...},
     *   canciones: [{id, titulo, bpm, ...}, ...],
     *   colaboradores: [{id, nick, avatar}, ...]
     * }, ...]
     */
    public function index()
    {
        $usuarioAutenticado = auth('sanctum')->user();

        // Cargar relaciones de forma eficiente
        $colecciones = Coleccion::with(['usuario', 'canciones', 'colaboradores'])
            ->select('id', 'titulo', 'artista', 'portada', 'descripcion', 'privacidad', 'tipo', 'fecha_publicacion', 'id_usuario')
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

        return response()->json($colecciones, 200);
    }

    /**
     * Crea una nueva colección en la base de datos
     *
     * Proceso:
     * 1. Valida datos usando ColeccionRequest
     * 2. Procesa y almacena portada en storage/public/portadas/
     * 3. Crea registro de colección en tabla colecciones
     * 4. Sincroniza colaboradores con deduplicación automática
     *    - Decodifica JSON si es string
     *    - Elimina duplicados, valores inválidos, y el creador
     * 5. Retorna colección creada con colaboradores incluidos
     *
     * @param ColeccionRequest $request Datos validados: titulo, artista, tipo (album/ep), privacidad, fecha_publicacion, id_usuario, portada, colaboradores
     * @return \Illuminate\Http\JsonResponse Colección creada con colaboradores
     *
     * @example
     * POST /api/colecciones
     * Headers: Authorization: Bearer {token}
     * Body (FormData): {
     *   titulo: "Summer Vibes 2026",
     *   artista: "DJ Master",
     *   tipo: "album",
     *   privacidad: "publica",
     *   fecha_publicacion: "2026",
     *   id_usuario: 1,
     *   portada: <File.jpg>,
     *   descripcion: "Best house tracks of summer",
     *   colaboradores: [3, 5]
     * }
     * Response: {
     *   error: false,
     *   message: "¡Colección creada con éxito!",
     *   coleccion: {id, titulo, artista, tipo, portada, colaboradores: [{id, nick, avatar}, ...], ...}
     * }
     */
    public function store(ColeccionRequest $request)
    {
        // Procesar y guardar portada en storage
        $rutaPortada = $request->file('portada')->store('portadas', 'public');

        // Obtener datos validados
        $datos = $request->validated();

        // Crear colección con los datos validados
        $coleccion = Coleccion::create([
            'titulo' => $datos['titulo'],
            'artista' => $datos['artista'],
            'tipo' => $datos['tipo'], // album o ep
            'privacidad' => $datos['privacidad'],
            'fecha_publicacion' => $datos['fecha_publicacion'],
            'id_usuario' => $datos['id_usuario'],
            'portada' => $rutaPortada,
        ]);

        // Sincronizar colaboradores con deduplicación automática
        $colaboradores = $request->input('colaboradores', []);
        // Decodificar JSON si viene como string
        if (is_string($colaboradores)) {
            $colaboradores = json_decode($colaboradores, true) ?? [];
        }
        // Limpiar: eliminar duplicados, valores inválidos y el creador
        if (is_array($colaboradores)) {
            $colaboradores = array_filter(
                array_unique(
                    array_map('intval', $colaboradores) // Convertir a int, eliminar no-numéricos
                ),
                fn($id) => $id > 0 && $id !== $datos['id_usuario'] // Excluir 0 y el creador
            );
            if (!empty($colaboradores)) {
                $coleccion->colaboradores()->sync($colaboradores);
            }
        }

        return response()->json([
            'error' => false,
            'message' => '¡Colección creada con éxito!',
            'coleccion' => $coleccion->load('colaboradores')
        ], 201);
    }

    /**
     * Obtiene los detalles completos de una colección específica
     *
     * Verifica privacidad y solo retorna la colección si:
     * - Es pública (cualquier usuario puede verla)
     * - Es privada AND el usuario actual es el creador
     *
     * Incluye:
     * - Metadata: título, artista, tipo, privacidad, fecha publicación
     * - Relaciones: usuario creador, todas las canciones en la colección, colaboradores
     *
     * @param string $id ID de la colección
     * @return \Illuminate\Http\JsonResponse Detalles de la colección o error 403 si no tiene permiso
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si la colección no existe
     *
     * @example
     * GET /api/colecciones/1
     * Response: {
     *   id: 1,
     *   titulo: "Summer Vibes 2026",
     *   artista: "DJ Master",
     *   portada: "portadas/coleccion-1.jpg",
     *   descripcion: "Best house tracks of summer",
     *   privacidad: "publica",
     *   tipo: "album",
     *   fecha_publicacion: "2026",
     *   usuario: {id: 1, nick: "dj_master", avatar: "..."},
     *   canciones: [{id, titulo, bpm, estilo, ...}, ...],
     *   colaboradores: [{id, nick, avatar}, ...]
     * }
     *
     * @example
     * GET /api/colecciones/999 (colección privada de otro usuario)
     * Response: { error: "No tienes permiso para ver esta colección" } (403)
     */
    public function show(string $id)
    {
        $usuarioAutenticado = auth('sanctum')->user();

        $coleccion = Coleccion::with(['usuario', 'canciones', 'colaboradores'])
            ->select('id', 'titulo', 'artista', 'portada', 'descripcion', 'privacidad', 'tipo', 'fecha_publicacion', 'id_usuario')
            ->findOrFail($id);

        // Verificar privacidad: solo el creador puede ver sus colecciones privadas
        if ($coleccion->privacidad === 'privada' && (!$usuarioAutenticado || $coleccion->id_usuario !== $usuarioAutenticado->id)) {
            return response()->json(['error' => 'No tienes permiso para ver esta colección'], 403);
        }

        return response()->json($coleccion, 200);
    }

    /**
     * Actualiza una colección existente en la base de datos
     *
     * Permite actualizar metadata, portada y colaboradores.
     * Las colecciones protegidas del sistema no se pueden editar.
     *
     * Proceso:
     * 1. Obtiene colección por ID o lanza excepción
     * 2. Verifica que no esté protegida (colecciones del sistema)
     * 3. Valida datos usando ColeccionRequest
     * 4. Reemplaza portada si se proporciona
     * 5. Actualiza datos en base de datos
     * 6. Sincroniza colaboradores con deduplicación automática
     * 7. Retorna colección actualizada
     *
     * @param ColeccionRequest $request Datos a actualizar (validados)
     * @param string $id ID de la colección a actualizar
     * @return \Illuminate\Http\JsonResponse Respuesta con colección actualizada
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si la colección no existe
     *
     * @example
     * PUT /api/colecciones/1
     * Headers: Authorization: Bearer {token}
     * Body (FormData): {
     *   titulo: "Summer Vibes 2026 (Updated)",
     *   artista: "DJ Master",
     *   descripcion: "Updated description",
     *   privacidad: "publica",
     *   portada: <File.jpg> (opcional),
     *   colaboradores: [3, 5, 7]
     * }
     * Response: {
     *   error: false,
     *   message: "Colección actualizada con éxito",
     *   coleccion: {id, titulo, artista, portada, colaboradores: [...], ...}
     * }
     *
     * @example
     * PUT /api/colecciones/999 (colección del sistema)
     * Response: { error: "No puedes modificar colecciones del sistema" } (403)
     */
    public function update(ColeccionRequest $request, string $id)
    {
        $coleccion = Coleccion::findOrFail($id);

        // Verificar si la colección está protegida (del sistema)
        if ($coleccion->protegida) {
            return response()->json(['error' => 'No puedes modificar colecciones del sistema'], 403);
        }

        // Paso 1: Obtener datos validados
        $datosValidados = $request->validated();

        // Paso 2: Procesar nueva portada si se proporciona
        if ($request->hasFile('portada')) {
            $datosValidados['portada'] = $request->file('portada')->store('portadas', 'public');
        }

        // Paso 3: Actualizar base de datos
        $coleccion->update($datosValidados);

        // Paso 4: Sincronizar colaboradores con deduplicación automática
        if ($request->has('colaboradores')) {
            $colaboradores = $request->input('colaboradores', []);
            \Log::info('UPDATE COLECCION - colaboradores recibidos:', ['raw' => $colaboradores]);
            // Decodificar JSON si viene como string
            if (is_string($colaboradores)) {
                $colaboradores = json_decode($colaboradores, true) ?? [];
                \Log::info('UPDATE COLECCION - colaboradores decodificados:', ['decoded' => $colaboradores]);
            }
            // Limpiar: eliminar duplicados, valores inválidos y el creador
            if (is_array($colaboradores)) {
                $colaboradores = array_filter(
                    array_unique(
                        array_map('intval', $colaboradores) // Convertir a int, eliminar no-numéricos
                    ),
                    fn($id) => $id > 0 && $id !== $coleccion->id_usuario // Excluir 0 y el creador
                );
                \Log::info('UPDATE COLECCION - colaboradores limpios:', ['cleaned' => $colaboradores]);
                if (!empty($colaboradores)) {
                    $coleccion->colaboradores()->sync($colaboradores);
                    \Log::info('UPDATE COLECCION - sync ejecutado con:', ['ids' => $colaboradores]);
                } else {
                    // Si no hay colaboradores válidos, limpiar la relación
                    $coleccion->colaboradores()->sync([]);
                    \Log::info('UPDATE COLECCION - sync ejecutado con array vacío');
                }
            }
        } else {
            \Log::info('UPDATE COLECCION - colaboradores NO recibidos en request');
        }

        return response()->json([
            'error' => false,
            'message' => 'Colección actualizada con éxito',
            'coleccion' => $coleccion->load('colaboradores')
        ], 200);
    }

    /**
     * Elimina una colección de la base de datos
     *
     * Las colecciones protegidas del sistema no se pueden eliminar.
     *
     * @param string $id ID de la colección a eliminar
     * @return \Illuminate\Http\JsonResponse Respuesta vacía con status 204 o error 403
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si la colección no existe
     *
     * @example
     * DELETE /api/colecciones/1
     * Headers: Authorization: Bearer {token}
     * Response: (empty, status 204 No Content)
     *
     * @example
     * DELETE /api/colecciones/999 (colección del sistema)
     * Response: { error: "No puedes eliminar colecciones del sistema" } (403)
     */
    public function topColecciones()
    {
        $colecciones = Coleccion::query()
            ->select('id', 'titulo', 'artista', 'portada', 'tipo', 'id_usuario')
            ->where('privacidad', 'publica')
            ->with(['usuario:id,nick,nombre,avatar'])
            ->withCount('canciones')
            ->selectSub(function ($q) {
                $q->from('reproducciones as r')
                    ->join('canciones as c', 'r.id_cancion', '=', 'c.id')
                    ->whereColumn('c.id_coleccion', 'colecciones.id')
                    ->selectRaw('COUNT(*)');
            }, 'reproducciones_total')
            ->orderByDesc('reproducciones_total')
            ->orderByDesc('canciones_count')
            ->limit(50)
            ->get();

        return response()->json($colecciones, 200);
    }

    public function destroy(string $id)
    {
        $coleccion = Coleccion::findOrFail($id);

        // Verificar si la colección está protegida (del sistema)
        if ($coleccion->protegida) {
            return response()->json(['error' => 'No puedes eliminar colecciones del sistema'], 403);
        }

        $coleccion->delete();

        return response()->json(null, 204);
    }

    /**
     * Lista los colaboradores de una colección
     */
    public function colaboradores(string $id)
    {
        $coleccion = Coleccion::with('colaboradores')->findOrFail($id);
        return response()->json($coleccion->colaboradores, 200);
    }

    /**
     * Agrega un colaborador a una colección
     */
    public function agregarColaborador(string $id, string $usuarioId)
    {
        $coleccion = Coleccion::findOrFail($id);
        $usuarioAutenticado = auth('sanctum')->user();

        if ($coleccion->id_usuario !== $usuarioAutenticado->id) {
            return response()->json(['error' => 'No tienes permiso para modificar esta colección'], 403);
        }

        if ((int)$usuarioId === $coleccion->id_usuario) {
            return response()->json(['error' => 'No puedes ser tu propio colaborador'], 422);
        }

        $coleccion->colaboradores()->attach($usuarioId);
        return response()->json($coleccion->load('colaboradores')->colaboradores, 200);
    }

    /**
     * Elimina un colaborador de una colección
     */
    public function removerColaborador(string $id, string $usuarioId)
    {
        $coleccion = Coleccion::findOrFail($id);
        $usuarioAutenticado = auth('sanctum')->user();

        if ($coleccion->id_usuario !== $usuarioAutenticado->id) {
            return response()->json(['error' => 'No tienes permiso para modificar esta colección'], 403);
        }

        $coleccion->colaboradores()->detach($usuarioId);
        return response()->json($coleccion->load('colaboradores')->colaboradores, 200);
    }

    /**
     * Agrega una canción a una colección
     *
     * Permite al propietario de una colección agregar canciones después de su creación.
     * A diferencia de playlists (que usan relación muchos-a-muchos), las colecciones
     * usan una relación uno-a-muchos, por lo que simplemente se actualiza el campo
     * id_coleccion de la canción.
     *
     * @param string $coleccionId ID de la colección
     * @param Request $request Body debe contener: { id_cancion: integer }
     * @return \Illuminate\Http\JsonResponse Éxito o error con detalles
     */
    public function agregarCancion(string $coleccionId, Request $request)
    {
        $usuarioAutenticado = auth('sanctum')->user();

        // Verificar autenticación
        if (!$usuarioAutenticado) {
            return response()->json(['error' => true, 'message' => 'No autenticado'], 401);
        }

        // Obtener colección
        $coleccion = Coleccion::findOrFail($coleccionId);

        // Verificar que usuario es propietario de la colección
        if ((int)$coleccion->id_usuario !== (int)$usuarioAutenticado->id) {
            return response()->json(['error' => true, 'message' => 'No tienes permiso para modificar esta colección'], 403);
        }

        // Validar que la canción existe
        $idCancion = $request->input('id_cancion');
        $cancion = \App\Models\Cancion::findOrFail($idCancion);

        // Verificar que la canción no está ya en la colección
        if ((int)$cancion->id_coleccion === (int)$coleccion->id) {
            return response()->json(['error' => true, 'message' => 'La canción ya está en esta colección'], 400);
        }

        // Asignar la canción a la colección
        $cancion->id_coleccion = $coleccion->id;
        $cancion->save();

        return response()->json([
            'error' => false,
            'message' => 'Canción agregada a la colección con éxito'
        ], 200);
    }
}
