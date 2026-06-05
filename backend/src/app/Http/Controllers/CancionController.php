<?php

namespace App\Http\Controllers;

use App\Models\Cancion;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\CancionRequest;
use Illuminate\Support\Facades\Log;

/**
 * CancionController - Gestión de canciones y audios
 *
 * Controla las operaciones CRUD para canciones incluyendo:
 * - Listar canciones públicas (y privadas si pertenecen al usuario)
 * - Crear nuevas canciones con archivos de audio y portada
 * - Cargar relaciones: usuario creador, colección, colaboradores
 * - Actualizar metadatos, archivos y colaboradores
 * - Eliminar canciones junto con archivos asociados (audio y portada)
 * - Control de privacidad: canciones públicas/privadas
 * - Sincronizar colaboradores con deduplicación automática
 * - Contar likes y reproducciones por canción
 * - Verificar si usuario autenticado ha dado like a la canción
 *
 * @package App\Http\Controllers
 */
class CancionController extends Controller
{
    /**
     * Obtiene la lista de canciones accesibles al usuario actual
     *
     * Lógica de privacidad:
     * - Cualquier usuario puede ver canciones públicas
     * - Solo el creador puede ver sus propias canciones privadas
     * - Los no autenticados solo ven canciones públicas
     *
     * Incluye:
     * - Metadata: BPM, tonalidad, estilo, privacidad, fecha publicación
     * - Relaciones: usuario creador, colección, colaboradores
     * - Contador: número total de reproducciones
     *
     * @return \Illuminate\Http\JsonResponse Array de canciones accesibles con conteo de reproducciones
     *
     * @example
     * GET /api/canciones
     * Response: [{
     *   id: 1,
     *   titulo: "House Vibes",
     *   bpm: 128,
     *   tonalidad: "A Minor",
     *   estilo: "House",
     *   ubicacion: "audios/...",
     *   portada: "portadas/...",
     *   privacidad: "publica",
     *   fecha_publicacion: "2026",
     *   usuario: {id, nick, avatar, ...},
     *   coleccion: {id, titulo, ...},
     *   colaboradores: [{id, nick, avatar}, ...],
     *   reproducciones_count: 342
     * }, ...]
     */
    public function index()
    {
        $usuarioAutenticado = auth('sanctum')->user();

        $canciones = Cancion::with(['usuario', 'coleccion', 'colaboradores', 'estilos'])
            ->select('id', 'titulo', 'bpm', 'tonalidad', 'estilo', 'ubicacion', 'portada', 'privacidad', 'fecha_publicacion', 'id_usuario', 'id_coleccion')
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
            ->withCount('reproducciones')
            ->get();

        return response()->json($canciones, 200);
    }

    /**
     * Crea una nueva canción en la base de datos
     *
     * Proceso:
     * 1. Valida datos completos usando CancionRequest
     * 2. Procesa archivo de audio y lo almacena en storage/public/audios/
     * 3. Procesa archivo de portada y lo almacena en storage/public/portadas/
     * 4. Asigna usuario creador (propietario de la canción)
     * 5. Establece fecha y privacidad con valores por defecto
     * 6. Guarda canción en base de datos
     * 7. Adjunta canción a playlist si se proporciona id_playlist
     * 8. Sincroniza colaboradores con deduplicación automática
     *    - Decodifica JSON si es string
     *    - Elimina duplicados, valores inválidos, y el creador
     *
     * @param CancionRequest $request Datos validados: titulo, bpm, tonalidad, estilo, privacidad, fecha_publicacion, archivo, portada, colaboradores, id_playlist
     * @return \Illuminate\Http\JsonResponse Canción creada con colaboradores incluidos
     *
     * @example
     * POST /api/canciones
     * Headers: Authorization: Bearer {token}
     * Body (FormData): {
     *   titulo: "House Vibes 2026",
     *   bpm: 128,
     *   tonalidad: "A Minor",
     *   estilo: "House",
     *   privacidad: "publica",
     *   fecha_publicacion: "2026",
     *   archivo: <File.mp3>,
     *   portada: <File.jpg>,
     *   colaboradores: [3, 5],
     *   id_playlist: 10
     * }
     * Response: {
     *   mensaje: "Canción subida con éxito",
     *   cancion: {id, titulo, bpm, ubicacion, portada, colaboradores: [{id, nick, avatar}, ...], ...}
     * }
     */
    public function store(CancionRequest $request)
    {
        // Paso 1: Instanciar con datos validados (protección total contra inyecciones)
        $datosValidados = $request->validated();

        // DEBUG: Log qué id_coleccion se recibe
        Log::info('📀 STORE: id_coleccion recibido', [
            'id_coleccion' => $datosValidados['id_coleccion'] ?? 'NO EXISTE',
            'tipo' => gettype($datosValidados['id_coleccion'] ?? null),
            'empty()' => empty($datosValidados['id_coleccion']) ? 'true' : 'false',
            'todos_datos' => $datosValidados
        ]);

        $cancion = new Cancion($datosValidados);

        // Paso 2: Procesar archivo de audio
        if ($request->hasFile('archivo')) {
            $rutaAudio = $request->file('archivo')->store('audios', 'public');
            $cancion->ubicacion = $rutaAudio;
        }

        // Paso 3: Procesar archivo de portada
        if ($request->hasFile('portada')) {
            $rutaPortada = $request->file('portada')->store('portadas', 'public');
            $cancion->portada = $rutaPortada;
        }

        // Paso 4: Asignar usuario creador de forma inteligente
        if ($request->filled('id_usuario')) {
            $cancion->id_usuario = $request->id_usuario;
        } else {
            $cancion->id_usuario = $request->user() ? $request->user()->id : 1;
        }

        // Paso 5: Asignar colección por defecto (Singles) si está vacía O null
        if (empty($datosValidados['id_coleccion']) || $datosValidados['id_coleccion'] === null) {
            $usuario = \App\Models\Usuario::find($cancion->id_usuario);
            if ($usuario) {
                $singlesCollection = $usuario->colecciones()
                    ->where('titulo', 'Singles')
                    ->first();
                if ($singlesCollection) {
                    $cancion->id_coleccion = $singlesCollection->id;
                    Log::info('📀 Asignando track a Singles por defecto:', [
                        'id_coleccion_recibido' => $datosValidados['id_coleccion'] ?? 'NO EXISTE',
                        'singles_id' => $singlesCollection->id,
                        'usuario_id' => $usuario->id
                    ]);
                }
            }
        } else {
            Log::info('📀 Usando id_coleccion proporcionado:', [
                'id_coleccion' => $datosValidados['id_coleccion'],
                'tipo' => gettype($datosValidados['id_coleccion'])
            ]);
        }

        // Paso 6: Asignar fecha y privacidad con valores por defecto
        $cancion->fecha_publicacion = $request->fecha_publicacion ?? date('Y');
        $cancion->privacidad = $request->privacidad ?? 'publica';

        // Paso 7: Guardar en base de datos
        $cancion->save();

        // Paso 8: Adjuntar a playlist si se proporciona
        if ($request->filled('id_playlist')) {
            $playlist = \App\Models\Playlist::find($request->id_playlist);
            if ($playlist) {
                $playlist->canciones()->attach($cancion->id, [
                    'orden' => 'fechaAgregadaDesc'
                ]);
            }
        }

        // Paso 9: Sincronizar colaboradores con deduplicación automática
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
                fn($id) => $id > 0 && $id !== $cancion->id_usuario // Excluir 0 y el creador
            );
            if (!empty($colaboradores)) {
                $cancion->colaboradores()->sync($colaboradores);
            }
        }

        // Paso 10: Sincronizar estilos si se proporcionó (múltiples estilos)
        $estilos = $request->input('estilos', []);
        // Decodificar JSON si viene como string
        if (is_string($estilos)) {
            $estilos = json_decode($estilos, true) ?? [];
        }
        // Procesar array de IDs de estilos
        if (is_array($estilos) && !empty($estilos)) {
            // Si vienen IDs directamente, sincronizar
            $estiloIds = array_filter(array_map('intval', $estilos), fn($id) => $id > 0);
            if (!empty($estiloIds)) {
                $cancion->estilos()->sync($estiloIds);
            }
        }
        // Fallback: si viene el campo 'estilo' antiguo (un solo estilo como string)
        elseif ($request->filled('estilo')) {
            $estiloNombre = $request->input('estilo');
            $estilo = \App\Models\Estilo::where('nombre', $estiloNombre)->first();
            if ($estilo) {
                $cancion->estilos()->sync([$estilo->id]);
            }
        }

        return response()->json([
            'mensaje' => 'Canción subida con éxito',
            'cancion' => $cancion->load('colaboradores', 'estilos')
        ], 201);
    }

    /**
     * Obtiene los detalles completos de una canción específica
     *
     * Verifica privacidad y solo retorna la canción si:
     * - Es pública (cualquier usuario puede verla)
     * - Es privada AND el usuario actual es el creador
     *
     * Incluye:
     * - Metadata completa: BPM, tonalidad, estilo, privacidad, fecha
     * - Relaciones: usuario creador, colección, colaboradores
     * - Contadores: número de likes y reproducciones
     * - Indicador personalizado: si el usuario autenticado ha dado like
     *
     * @param string $id ID de la canción
     * @return \Illuminate\Http\JsonResponse Detalles de la canción o error 403 si no tiene permiso
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si la canción no existe
     *
     * @example
     * GET /api/canciones/1
     * Response: {
     *   id: 1,
     *   titulo: "House Vibes",
     *   bpm: 128,
     *   tonalidad: "A Minor",
     *   estilo: "House",
     *   ubicacion: "audios/cancion-1.mp3",
     *   portada: "portadas/cancion-1.jpg",
     *   privacidad: "publica",
     *   fecha_publicacion: "2026",
     *   usuario: {id: 1, nick: "dj_master", avatar: "..."},
     *   coleccion: {id: 5, titulo: "My Album", ...},
     *   colaboradores: [{id, nick, avatar}, ...],
     *   likes_count: 127,
     *   reproducciones_count: 3450,
     *   liked_by_me: true
     * }
     *
     * @example
     * GET /api/canciones/999 (canción privada del usuario actual)
     * Headers: Authorization: Bearer {token}
     * Response: { ... (detalles completos) }
     *
     * @example
     * GET /api/canciones/999 (canción privada de otro usuario)
     * Response: { error: "No tienes permiso para ver esta canción" } (403)
     */
    public function show(string $id)
    {
        $usuarioAutenticado = auth('sanctum')->user();

        $cancion = Cancion::with(['usuario', 'coleccion', 'colaboradores', 'estilos'])
            ->select('id', 'titulo', 'bpm', 'tonalidad', 'estilo', 'ubicacion', 'portada', 'privacidad', 'fecha_publicacion', 'id_usuario', 'id_coleccion')
            ->withCount(['likes', 'reproducciones'])
            ->findOrFail($id);

        // Verificar privacidad: solo el creador puede ver sus canciones privadas
        if ($cancion->privacidad === 'privada' && (!$usuarioAutenticado || $cancion->id_usuario !== $usuarioAutenticado->id)) {
            return response()->json(['error' => 'No tienes permiso para ver esta canción'], 403);
        }

        // Agregar indicador de si el usuario autenticado ha dado like
        $cancion->liked_by_me = $usuarioAutenticado
            ? $cancion->likes()->where('id_usuario', $usuarioAutenticado->id)->exists()
            : false;

        return response()->json($cancion, 200);
    }

    /**
     * Actualiza una canción existente en la base de datos
     *
     * Permite actualizar metadata, archivos de audio/portada y colaboradores.
     *
     * Proceso:
     * 1. Obtiene canción por ID o lanza excepción
     * 2. Valida datos usando CancionRequest
     * 3. Reemplaza audio si se proporciona:
     *    - Elimina archivo anterior del storage
     *    - Almacena nuevo audio en storage/public/audios/
     * 4. Reemplaza portada si se proporciona:
     *    - Elimina carátula anterior del storage
     *    - Almacena nueva portada en storage/public/portadas/
     * 5. Actualiza todos los datos en base de datos
     * 6. Sincroniza colaboradores con deduplicación automática
     * 7. Recarga modelo para retornar datos frescos
     *
     * @param CancionRequest $request Datos a actualizar (validados)
     * @param string $id ID de la canción a actualizar
     * @return \Illuminate\Http\JsonResponse Respuesta con canción actualizada
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si la canción no existe
     *
     * @example
     * PUT /api/canciones/1
     * Headers: Authorization: Bearer {token}
     * Body (FormData): {
     *   titulo: "House Vibes (Remixado)",
     *   bpm: 130,
     *   tonalidad: "A Minor",
     *   estilo: "House",
     *   privacidad: "publica",
     *   archivo: <File.mp3> (opcional),
     *   portada: <File.jpg> (opcional),
     *   colaboradores: [3, 5]
     * }
     * Response: {
     *   error: false,
     *   mensaje: "Canción actualizada con éxito",
     *   cancion: {id, titulo, bpm, ubicacion, portada, colaboradores: [...], ...}
     * }
     */
    public function update(CancionRequest $request, string $id)
    {
        // Log para debugging (verifica qué archivos y datos se recibieron)
        Log::info('Archivos recibidos en update de canción:', $request->allFiles());
        Log::info('Datos recibidos en update de canción:', $request->all());

        $cancion = Cancion::findOrFail($id);

        // Verificar que el usuario autenticado sea el propietario de la canción
        $usuarioAutenticado = auth('sanctum')->user();
        if ($cancion->id_usuario !== $usuarioAutenticado->id) {
            return response()->json(
                ['error' => true, 'message' => 'No tienes permiso para modificar esta canción'],
                403
            );
        }

        // Validar datos nuevos
        $datosValidados = $request->validated();

        // Paso 0: Asignar colección por defecto (Singles) si está vacía O null
        if (empty($datosValidados['id_coleccion']) || $datosValidados['id_coleccion'] === null) {
            $usuario = \App\Models\Usuario::find($cancion->id_usuario);
            if ($usuario) {
                $singlesCollection = $usuario->colecciones()
                    ->where('titulo', 'Singles')
                    ->first();
                if ($singlesCollection) {
                    $datosValidados['id_coleccion'] = $singlesCollection->id;
                    Log::info('📀 Reasignando track a Singles después de edición:', [
                        'cancion_id' => $cancion->id,
                        'singles_id' => $singlesCollection->id,
                        'usuario_id' => $usuario->id
                    ]);
                }
            }
        } else {
            Log::info('📀 Manteniendo id_coleccion en edición:', [
                'id_coleccion' => $datosValidados['id_coleccion'],
                'tipo' => gettype($datosValidados['id_coleccion'])
            ]);
        }

        // Paso 1: Procesar nuevo archivo de audio (si se proporciona)
        if ($request->hasFile('archivo')) {
            // Eliminar archivo anterior si existe
            if ($cancion->getRawOriginal('ubicacion') && Storage::disk('public')->exists($cancion->getRawOriginal('ubicacion'))) {
                Storage::disk('public')->delete($cancion->getRawOriginal('ubicacion'));
            }
            // Almacenar nuevo audio
            $datosValidados['ubicacion'] = $request->file('archivo')->store('audios', 'public');
        }

        // Paso 2: Procesar nueva portada (si se proporciona)
        if ($request->hasFile('portada')) {
            // Eliminar carátula anterior si existe.
            // OJO: usar getRawOriginal porque el accessor 'portada' devuelve una URL completa
            // (asset('storage/...')), no la ruta de storage. Con la URL, Storage::exists() fallaría
            // y la portada antigua quedaría huérfana.
            $portadaAnterior = $cancion->getRawOriginal('portada');
            if ($portadaAnterior && Storage::disk('public')->exists($portadaAnterior)) {
                Storage::disk('public')->delete($portadaAnterior);
            }
            // Almacenar nueva portada
            $datosValidados['portada'] = $request->file('portada')->store('portadas', 'public');
        }

        // Paso 3: Actualizar base de datos de forma segura
        $cancion->update($datosValidados);

        // Paso 4: Sincronizar colaboradores con deduplicación automática
        if ($request->has('colaboradores')) {
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
                    fn($id) => $id > 0 && $id !== $cancion->id_usuario // Excluir 0 y el creador
                );
                if (!empty($colaboradores)) {
                    $cancion->colaboradores()->sync($colaboradores);
                } else {
                    // Si no hay colaboradores válidos, limpiar la relación
                    $cancion->colaboradores()->sync([]);
                }
            }
        }

        // Paso 5: Sincronizar playlist (reemplazar con la seleccionada)
        if ($request->has('id_playlist')) {
            $playlistId = $request->input('id_playlist');

            if ($playlistId) {
                // Si se seleccionó una playlist, verificar que existe y pertenece al usuario
                $playlist = \App\Models\Playlist::where('id', $playlistId)
                    ->where('id_usuario', $cancion->id_usuario)
                    ->first();

                if ($playlist) {
                    // Usar sync para reemplazar: si estaba en otra, se quita y se agrega a la nueva
                    // sync([$id]) reemplaza automáticamente (desasocia las que no estén en el array)
                    $cancion->playlists()->sync([$playlistId]);
                }
            } else {
                // Si está vacío, no tocar las playlists actuales (dejar como están)
                // Para remover de todas, se dejaría vacío en el frontend
            }
        }

        // Paso 6: Sincronizar estilos si se proporcionó (múltiples estilos)
        if ($request->has('estilos')) {
            $estilos = $request->input('estilos', []);
            // Decodificar JSON si viene como string
            if (is_string($estilos)) {
                $estilos = json_decode($estilos, true) ?? [];
            }
            // Procesar array de IDs de estilos
            if (is_array($estilos)) {
                $estiloIds = array_filter(array_map('intval', $estilos), fn($id) => $id > 0);
                if (!empty($estiloIds)) {
                    $cancion->estilos()->sync($estiloIds);
                } else {
                    $cancion->estilos()->sync([]);
                }
            }
        }
        // Fallback: si viene el campo 'estilo' antiguo (un solo estilo como string)
        elseif ($request->has('estilo')) {
            $estiloNombre = $request->input('estilo');
            if ($estiloNombre) {
                $estilo = \App\Models\Estilo::where('nombre', $estiloNombre)->first();
                if ($estilo) {
                    $cancion->estilos()->sync([$estilo->id]);
                } else {
                    $cancion->estilos()->sync([]);
                }
            } else {
                $cancion->estilos()->sync([]);
            }
        }

        // Paso 7: Recargar modelo para retornar datos frescos
        $cancion->refresh();
        $cancion->load('colaboradores', 'estilos');

        return response()->json([
            'error' => false,
            'mensaje' => 'Canción actualizada con éxito',
            'cancion' => $cancion
        ], 200);
    }

    /**
     * Elimina una canción de la base de datos
     *
     * Proceso:
     * 1. Obtiene canción por ID o lanza excepción
     * 2. Elimina archivo de audio del storage (si existe)
     * 3. Elimina archivo de portada del storage (si existe)
     * 4. Elimina registro de canción de base de datos
     * 5. Retorna respuesta 204 (sin contenido)
     *
     * Las relaciones (likes, reproducciones, colaboradores) se eliminan
     * automáticamente por cascada si se han configurado correctamente en el modelo.
     *
     * @param string $id ID de la canción a eliminar
     * @return \Illuminate\Http\JsonResponse Respuesta vacía con status 204
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si la canción no existe
     *
     * @example
     * DELETE /api/canciones/1
     * Headers: Authorization: Bearer {token}
     * Response: (empty, status 204 No Content)
     */
    public function destroy(string $id)
    {
        $cancion = Cancion::findOrFail($id);

        // Eliminar archivo de audio del storage si existe
        if ($cancion->getRawOriginal('ubicacion') && Storage::disk('public')->exists($cancion->getRawOriginal('ubicacion'))) {
            Storage::disk('public')->delete($cancion->getRawOriginal('ubicacion'));
        }

        // Eliminar archivo de portada del storage si existe.
        // Usar getRawOriginal porque el accessor 'portada' devuelve una URL completa, no la ruta.
        $portadaRaw = $cancion->getRawOriginal('portada');
        if ($portadaRaw && Storage::disk('public')->exists($portadaRaw)) {
            Storage::disk('public')->delete($portadaRaw);
        }

        // Eliminar registro de base de datos (cascada elimina relaciones)
        $cancion->delete();

        return response()->json(null, 204);
    }

    /**
     * Lista los colaboradores de una canción
     *
     * @param string $id ID de la canción
     * @return \Illuminate\Http\JsonResponse Array de colaboradores
     */
    public function colaboradores(string $id)
    {
        $cancion = Cancion::with('colaboradores')->findOrFail($id);
        return response()->json($cancion->colaboradores, 200);
    }

    /**
     * Agrega un colaborador a una canción
     *
     * Solo el propietario de la canción puede agregar colaboradores.
     *
     * @param string $id ID de la canción
     * @param int $usuarioId ID del usuario a agregar como colaborador
     * @return \Illuminate\Http\JsonResponse Lista de colaboradores actualizada
     */
    public function agregarColaborador(string $id, string $usuarioId)
    {
        $cancion = Cancion::findOrFail($id);
        $usuarioAutenticado = auth('sanctum')->user();

        // Verificar que el usuario autenticado sea el propietario
        if ($cancion->id_usuario !== $usuarioAutenticado->id) {
            return response()->json(['error' => 'No tienes permiso para modificar esta canción'], 403);
        }

        // No permitir agregar al propietario como colaborador
        if ((int)$usuarioId === $cancion->id_usuario) {
            return response()->json(['error' => 'No puedes ser tu propio colaborador'], 422);
        }

        // Agregar colaborador (attach respeta unique constraint)
        $cancion->colaboradores()->attach($usuarioId);

        return response()->json($cancion->load('colaboradores')->colaboradores, 200);
    }

    /**
     * Elimina un colaborador de una canción
     *
     * Solo el propietario de la canción puede eliminar colaboradores.
     *
     * @param string $id ID de la canción
     * @param string $usuarioId ID del colaborador a eliminar
     * @return \Illuminate\Http\JsonResponse Lista de colaboradores actualizada
     */
    public function removerColaborador(string $id, string $usuarioId)
    {
        $cancion = Cancion::findOrFail($id);
        $usuarioAutenticado = auth('sanctum')->user();

        // Verificar que el usuario autenticado sea el propietario
        if ($cancion->id_usuario !== $usuarioAutenticado->id) {
            return response()->json(['error' => 'No tienes permiso para modificar esta canción'], 403);
        }

        // Remover colaborador
        $cancion->colaboradores()->detach($usuarioId);

        return response()->json($cancion->load('colaboradores')->colaboradores, 200);
    }
}