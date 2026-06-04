<?php

namespace App\Http\Controllers;

use App\Models\Evento;
use App\Http\Requests\EventoRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * EventoController - Gestión de eventos
 *
 * Controla las operaciones CRUD para eventos incluyendo:
 * - Crear, leer, actualizar y eliminar eventos
 * - Manejar relaciones con usuarios, géneros (estilos) y colaboradores
 * - Procesar uploads de imágenes
 * - Sincronizar datos relacionados con la BD
 *
 * @package App\Http\Controllers
 */
class EventoController extends Controller
{
    /**
     * Obtiene la lista completa de eventos con sus relaciones
     *
     * @return \Illuminate\Http\JsonResponse JSON con todos los eventos formateados
     * - Incluye géneros (estilos), usuarios asociados y colaboradores
     * - Selecciona solo campos necesarios de la BD
     *
     * @example
     * GET /api/eventos
     * Response: [{ id, nombre, nombre_sala, ubicacion, latitud, longitud, url_venta, imagen, fecha_evento, estilos[], usuarios[], colaboradores[] }]
     */
    public function index()
    {
        $eventos = Evento::with(['usuarios', 'estilos', 'colaboradores'])
            ->select('id', 'nombre', 'nombre_sala', 'ubicacion', 'latitud', 'longitud', 'url_venta', 'imagen', 'fecha_evento')
            ->get()
            ->map(fn($evento) => $this->formatearEvento($evento));

        return response()->json($eventos, 200);
    }

    /**
     * Crea un nuevo evento en la base de datos
     *
     * Proceso:
     * 1. Extrae y estructura datos de ubicación (dirección, latitud, longitud)
     * 2. Procesa y almacena la imagen en storage/public/eventos
     * 3. Crea registro de evento en tabla eventos
     * 4. Sincroniza géneros/estilos (relación many-to-many)
     * 5. Asocia evento al usuario autenticado (propietario)
     * 6. Sincroniza colaboradores (deduplicado automáticamente con sync())
     *
     * @param Request $request Datos del evento: nombre, nombre_sala, ubicacion, fecha_evento, url_venta, estilos, colaboradores, imagen
     * @return \Illuminate\Http\JsonResponse Evento creado con relaciones incluidas
     *
     * @example
     * POST /api/eventos
     * Body: {
     *   nombre: "Fiesta Electrónica 2026",
     *   nombre_sala: "Club Metropol",
     *   fecha_evento: "2026-07-15",
     *   ubicacion: { direccion: "Madrid, Spain", lat: 40.4168, lng: -3.7038 },
     *   estilos: [1, 2, 3],  // IDs de géneros
     *   colaboradores: [5, 7],  // IDs de usuarios colaboradores
     *   url_venta: "https://entradas.com/evento",
     *   imagen: <File>
     * }
     * Response: { id, nombre, ..., estilos: [{id, nombre, color}], colaboradores: [{id, nick, avatar}] }
     */
    public function store(EventoRequest $request)
    {
        // Paso 1: Extraer y normalizar datos de ubicación
        $ubicacion = $request->input('ubicacion');
        $datos = $request->all();

        if (is_array($ubicacion) || is_object($ubicacion)) {
            $ubicacion = (array)$ubicacion;
            $datos['ubicacion'] = $ubicacion['direccion'] ?? '';
            $datos['latitud'] = $ubicacion['lat'] ?? null;
            $datos['longitud'] = $ubicacion['lng'] ?? null;
        }

        // Paso 2: Procesar y guardar archivo de imagen
        if ($request->hasFile('imagen')) {
            // Almacena en storage/app/public/eventos/ con nombre único
            $rutaImagen = $request->file('imagen')->store('eventos', 'public');
            $datos['imagen'] = $rutaImagen;
        }

        // Paso 3: Crear evento en tabla eventos
        $evento = Evento::create($datos);

        // Paso 4: Sincronizar géneros/estilos (many-to-many)
        $estilos = $request->input('estilos', []);
        if (!empty($estilos)) {
            $evento->estilos()->sync($estilos);
        }

        // Paso 5: Asociar evento al usuario autenticado (propietario)
        $usuario = $request->user();
        if ($usuario) {
            $usuario->eventos()->attach($evento->id);
        }

        // Paso 6: Sincronizar colaboradores (sync() deduplica automáticamente)
        $colaboradores = $request->input('colaboradores', []);
        // Decodificar JSON si es string
        if (is_string($colaboradores)) {
            $colaboradores = json_decode($colaboradores, true) ?? [];
        }
        // Limpiar: eliminar duplicados, valores vacíos y el usuario actual
        if (is_array($colaboradores)) {
            $usuarioActual = $request->user() ? $request->user()->id : null;
            $colaboradores = array_filter(
                array_unique(
                    array_map('intval', $colaboradores) // Convertir a int y eliminar no-numéricos
                ),
                fn($id) => $id > 0 && (!$usuarioActual || $id !== $usuarioActual) // Excluir 0 y el usuario actual
            );
            if (!empty($colaboradores)) {
                $evento->colaboradores()->sync($colaboradores);
            }
        }

        // Paso 7: Retornar evento creado con todas sus relaciones cargadas
        return response()->json($this->formatearEvento($evento->load('usuarios', 'estilos', 'colaboradores')), 201);
    }

    /**
     * Obtiene los detalles completos de un evento específico
     *
     * @param string $id ID del evento
     * @return \Illuminate\Http\JsonResponse Evento con todas sus relaciones (usuarios, estilos, colaboradores)
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si el evento no existe
     *
     * @example
     * GET /api/eventos/123
     * Response: { id, nombre, nombre_sala, ubicacion, latitud, longitud, url_venta, imagen, fecha_evento, estilos[], usuarios[], colaboradores[] }
     */
    public function show(string $id)
    {
        $evento = Evento::with(['usuarios', 'estilos', 'colaboradores'])
            ->select('id', 'nombre', 'nombre_sala', 'ubicacion', 'latitud', 'longitud', 'url_venta', 'imagen', 'fecha_evento')
            ->findOrFail($id);

        return response()->json($this->formatearEvento($evento), 200);
    }

    /**
     * Actualiza un evento existente en la base de datos
     *
     * Proceso:
     * 1. Obtiene evento por ID o lanza excepción
     * 2. Extrae y procesa ubicación (dirección, latitud, longitud)
     * 3. Gestiona reemplazo de imagen: borra anterior si existe, almacena nueva
     * 4. Actualiza datos básicos del evento
     * 5. Sincroniza géneros/estilos si se proporcionan
     * 6. Sincroniza colaboradores con deduplicación automática
     *    - Decodifica JSON si es string
     *    - Elimina duplicados y valores inválidos
     *    - Excluye automáticamente al usuario actual
     *
     * @param Request $request Datos a actualizar: nombre, nombre_sala, ubicacion, fecha_evento, url_venta, estilos, colaboradores, imagen
     * @param string $id ID del evento a actualizar
     * @return \Illuminate\Http\JsonResponse Evento actualizado con todas sus relaciones
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si el evento no existe
     *
     * @example
     * PUT /api/eventos/123
     * Body: {
     *   nombre: "Fiesta Electrónica ACTUALIZADA",
     *   nombre_sala: "Club Metropol",
     *   fecha_evento: "2026-08-20",
     *   ubicacion: { direccion: "Barcelona, Spain", lat: 41.3851, lng: 2.1734 },
     *   estilos: [1, 2],  // Actualiza géneros (sync reemplaza los previos)
     *   colaboradores: [5],  // Actualiza colaboradores
     *   // imagen: <File> opcional para reemplazar
     * }
     * Response: { id, nombre, ..., estilos: [{id, nombre, color}], colaboradores: [{id, nick, avatar}] }
     */
    public function update(EventoRequest $request, string $id)
    {
        $evento = Evento::findOrFail($id);
        $datos = $request->all();

        // Paso 1: Extraer y procesar datos de ubicación
        $ubicacion = $request->input('ubicacion');
        if (is_array($ubicacion) || is_object($ubicacion)) {
            $ubicacion = (array)$ubicacion;
            $datos['ubicacion'] = $ubicacion['direccion'] ?? '';
            $datos['latitud'] = $ubicacion['lat'] ?? null;
            $datos['longitud'] = $ubicacion['lng'] ?? null;
        }

        // Paso 2: Gestionar reemplazo de imagen (borrar antigua si existe, guardar nueva)
        if ($request->hasFile('imagen')) {
            // 2a. Eliminar imagen anterior del storage si existe
            if ($evento->imagen) {
                Storage::disk('public')->delete($evento->imagen);
            }
            // 2b. Guardar nueva imagen en storage/app/public/eventos/
            $datos['imagen'] = $request->file('imagen')->store('eventos', 'public');
        }

        // Paso 3: Actualizar datos básicos del evento
        $evento->update($datos);

        // Paso 4: Sincronizar géneros/estilos (many-to-many)
        $estilos = $request->input('estilos', []);
        if ($request->has('estilos')) {
            $evento->estilos()->sync($estilos);
        }

        // Paso 5: Sincronizar colaboradores (con deduplicación automática)
        if ($request->has('colaboradores')) {
            $colaboradores = $request->input('colaboradores', []);
            // Decodificar JSON si viene como string en la solicitud
            if (is_string($colaboradores)) {
                $colaboradores = json_decode($colaboradores, true) ?? [];
            }
            // Limpiar: eliminar duplicados, valores vacíos y el usuario actual
            if (is_array($colaboradores)) {
                $usuarioActual = $request->user() ? $request->user()->id : null;
                $colaboradores = array_filter(
                    array_unique(
                        array_map('intval', $colaboradores) // Convertir a int, eliminar no-numéricos
                    ),
                    fn($id) => $id > 0 && (!$usuarioActual || $id !== $usuarioActual) // Excluir 0 y usuario actual
                );
                if (!empty($colaboradores)) {
                    $evento->colaboradores()->sync($colaboradores);
                } else {
                    // Si no hay colaboradores válidos, limpiar la relación
                    $evento->colaboradores()->sync([]);
                }
            }
        }

        // Paso 6: Retornar evento actualizado con todas sus relaciones cargadas
        return response()->json($this->formatearEvento($evento->load('usuarios', 'estilos', 'colaboradores')), 200);
    }

    /**
     * Elimina un evento de la base de datos
     *
     * Proceso:
     * 1. Obtiene evento por ID o lanza excepción si no existe
     * 2. Elimina el evento (cascada: borra relaciones en pivot tables automáticamente)
     * 3. Retorna respuesta 204 No Content (sin cuerpo)
     *
     * Nota: Las imágenes del storage NO se eliminan automáticamente.
     * Se recomienda implementar un Job o Policy para limpiar archivos huérfanos.
     *
     * @param string $id ID del evento a eliminar
     * @return \Illuminate\Http\JsonResponse Respuesta vacía con status 204
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si el evento no existe
     *
     * @example
     * DELETE /api/eventos/123
     * Response: (empty, status 204 No Content)
     */
    public function destroy(string $id)
    {
        $evento = Evento::findOrFail($id);
        $evento->delete();

        return response()->json(null, 204);
    }

    /**
     * Formatea un evento para la respuesta JSON de API
     *
     * Transforma el modelo Evento a un array con estructura estándar:
     * - Reestructura ubicación: divide campos latitud/longitud en objeto ubicacion anidado
     * - Convierte coordenadas a float para mayor precisión en JSON
     * - Agrega relaciones: usuarios (propietarios), estilos (géneros), colaboradores
     * - Maneja relaciones nulas: retorna arrays vacíos si relaciones no están cargadas
     *
     * Uso: Llamada internamente por index(), show(), store(), update() para
     * estandarizar todas las respuestas JSON de eventos.
     *
     * @param \App\Models\Evento $evento Modelo evento (idealmente con relaciones cargadas)
     * @return array Array asociativo con estructura: {id, nombre, nombre_sala, ubicacion, url_venta, imagen, fecha_evento, usuarios, estilos, colaboradores}
     *
     * @example
     * Input: Evento con id=1, nombre="Fiesta House", latitud=40.4168, longitud=-3.7038
     * Output:
     * {
     *   "id": 1,
     *   "nombre": "Fiesta House",
     *   "nombre_sala": "Club XYZ",
     *   "ubicacion": {
     *     "direccion": "Madrid, Spain",
     *     "lat": 40.4168,
     *     "lng": -3.7038
     *   },
     *   "url_venta": "https://entradas.com/evento",
     *   "imagen": "eventos/imagen.jpg",
     *   "fecha_evento": "2026-07-15",
     *   "usuarios": [{id, nick, avatar}],
     *   "estilos": [{id, nombre, color}],
     *   "colaboradores": [{id, nick, avatar}]
     * }
     */
    /**
     * Lista los colaboradores de un evento
     */
    public function colaboradores(string $id)
    {
        $evento = Evento::with('colaboradores')->findOrFail($id);
        return response()->json($evento->colaboradores, 200);
    }

    /**
     * Agrega un colaborador a un evento
     */
    public function agregarColaborador(string $id, string $usuarioId)
    {
        $evento = Evento::findOrFail($id);
        $usuarioAutenticado = auth('sanctum')->user();

        if ($evento->id_usuario !== $usuarioAutenticado->id) {
            return response()->json(['error' => 'No tienes permiso para modificar este evento'], 403);
        }

        if ((int)$usuarioId === $evento->id_usuario) {
            return response()->json(['error' => 'No puedes ser tu propio colaborador'], 422);
        }

        $evento->colaboradores()->attach($usuarioId);
        return response()->json($evento->load('colaboradores')->colaboradores, 200);
    }

    /**
     * Elimina un colaborador de un evento
     */
    public function removerColaborador(string $id, string $usuarioId)
    {
        $evento = Evento::findOrFail($id);
        $usuarioAutenticado = auth('sanctum')->user();

        if ($evento->id_usuario !== $usuarioAutenticado->id) {
            return response()->json(['error' => 'No tienes permiso para modificar este evento'], 403);
        }

        $evento->colaboradores()->detach($usuarioId);
        return response()->json($evento->load('colaboradores')->colaboradores, 200);
    }

    private function formatearEvento($evento)
    {
        return [
            'id' => $evento->id,
            'nombre' => $evento->nombre,
            'nombre_sala' => $evento->nombre_sala,
            'ubicacion' => [
                'direccion' => $evento->ubicacion,
                'lat' => (float)$evento->latitud,
                'lng' => (float)$evento->longitud
            ],
            'url_venta' => $evento->url_venta,
            'imagen' => $evento->imagen,
            'fecha_evento' => $evento->fecha_evento,
            'usuarios' => $evento->usuarios ?? [],
            'estilos' => $evento->estilos ?? [],
            'colaboradores' => $evento->colaboradores ?? [],
        ];
    }
}
