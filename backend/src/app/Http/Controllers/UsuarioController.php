<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Http\Requests\UsuarioRequest;
use Illuminate\Http\Request;

/**
 * UsuarioController - Gestión de usuarios y perfiles
 *
 * Controla las operaciones CRUD para usuarios incluyendo:
 * - Listar usuarios y obtener detalles de perfil
 * - Crear y actualizar perfiles de usuario
 * - Gestionar followers/seguidos y amigos (usuarios que se siguen mutuamente)
 * - Procesar uploads de avatar y banner
 * - Listar usuarios por popularidad (top oyentes según reproducciones de canciones)
 * - Gestionar equipamiento asociado a usuarios (software y hardware)
 * - Cargar relaciones complejas: canciones, colecciones, playlists, softwares, hardwares, eventos, galerías
 *
 * @package App\Http\Controllers
 */
class UsuarioController extends Controller
{
    /**
     * Obtiene la lista completa de usuarios registrados con todas sus relaciones
     *
     * @return \Illuminate\Http\JsonResponse JSON con todos los usuarios incluyendo:
     * - Datos básicos: id, nick, nombre, email, ubicación, avatar, banner, biografía
     * - Redes sociales: twitter, instagram, youtube, spotify, tiktok, soundcloud
     * - Relaciones: canciones, colecciones, playlists, canciones_liked, comentarios, seguidos, seguidores, softwares, hardwares, eventos, galerías
     *
     * @example
     * GET /api/usuarios
     * Response: [{id, nick, nombre, email, ubicacion, latitud, longitud, avatar, banner, biografia, rol, twitter, ..., canciones[], colecciones[], ...}]
     */
    public function index()
    {
        $usuarios = Usuario::select('id', 'nick', 'nombre', 'email', 'ubicacion', 'latitud', 'longitud', 'avatar', 'banner', 'biografia', 'rol', 'twitter', 'instagram', 'youtube', 'spotify', 'tiktok', 'soundcloud')
            ->with(['canciones', 'colecciones', 'playlists', 'canciones_liked', 'comentarios', 'seguidos', 'seguidores', 'softwares', 'hardwares', 'eventos', 'galeria'])
            ->get();

        return response()->json($usuarios, 200);
    }

    /**
     * Obtiene la lista de amigos del usuario autenticado
     *
     * Un "amigo" es un usuario con el que se tiene relación bidireccional:
     * ambos se siguen mutuamente. Filtra automáticamente usuarios seguidos
     * que no siguen de vuelta.
     *
     * @param Request $request Incluye el usuario autenticado a través del token
     * @return \Illuminate\Http\JsonResponse Lista de amigos con sus datos básicos
     *
     * @example
     * GET /api/usuarios/amigos/lista
     * Headers: Authorization: Bearer {token}
     * Response: [{id, nick, nombre, avatar, ...}] (solo amigos bidireccionales)
     */
    public function amigos(Request $request)
    {
        $usuario = $request->user();
        if (!$usuario) {
            return response()->json(['error' => 'No autenticado'], 401);
        }

        $amigos = $usuario->amigos();

        return response()->json($amigos->toArray(), 200);
    }

    /**
     * Obtiene los amigos de un usuario específico por ID
     *
     * @param string $id ID del usuario
     * @return \Illuminate\Http\JsonResponse Lista de amigos del usuario
     */
    public function amigosDelUsuario(string $id)
    {
        $usuario = Usuario::findOrFail($id);
        $amigos = $usuario->amigos();

        return response()->json($amigos->toArray(), 200);
    }

    /**
     * Obtiene ranking público de usuarios ordenados por popularidad (reproducciones)
     *
     * Calcula el total de reproducciones de todas las canciones de cada usuario
     * y retorna el top 50 usuarios ordenados por reproducciones descendentes.
     * Como desempate secundario, ordena por número de canciones publicadas.
     *
     * Proceso:
     * 1. Selecciona datos de perfil básicos
     * 2. Cuenta número total de canciones de cada usuario
     * 3. Suma el total de reproducciones (reproducciones_total):
     *    - Inner join con tabla reproducciones
     *    - Join con tabla canciones para filtrar por usuario propietario
     *    - COUNT(*) agrega todas las reproducciones
     * 4. Ordena por reproducciones DESC (mayor a menor)
     * 5. Desempate por número de canciones DESC
     * 6. Limita a top 50
     *
     * @return \Illuminate\Http\JsonResponse Array de hasta 50 usuarios con datos de popularidad
     *
     * @example
     * GET /api/usuarios/top-oyentes
     * Response: [{
     *   id: 1,
     *   nick: "dj_master",
     *   nombre: "DJ Master",
     *   avatar: "avatars/...",
     *   banner: "banners/...",
     *   biografia: "Electronic music producer",
     *   ubicacion: "Barcelona",
     *   latitud: 41.3851,
     *   longitud: 2.1734,
     *   canciones_count: 25,
     *   reproducciones_total: 5420
     * }, ...]
     */
    public function topOyentes()
    {
        $usuarios = Usuario::query()
            ->select('id', 'nick', 'nombre', 'avatar', 'banner', 'biografia', 'ubicacion', 'latitud', 'longitud')
            ->withCount('canciones')
            ->selectSub(function ($q) {
                $q->from('reproducciones as r')
                    ->join('canciones as c', 'r.id_cancion', '=', 'c.id')
                    ->whereColumn('c.id_usuario', 'usuarios.id')
                    ->selectRaw('COUNT(*)');
            }, 'reproducciones_total')
            ->orderByDesc('reproducciones_total')
            ->orderByDesc('canciones_count')
            ->limit(50)
            ->get();

        return response()->json($usuarios, 200);
    }

    /**
     * Crea un nuevo usuario en la base de datos
     *
     * Proceso:
     * 1. Valida datos usando UsuarioRequest (incluye campos obligatorios, formatos, etc.)
     * 2. Encripta la contraseña si se proporciona
     * 3. Procesa y almacena avatar en storage/public/avatars/
     * 4. Procesa y almacena banner en storage/public/banners/
     * 5. Crea registro de usuario en tabla usuarios
     * 6. Retorna usuario creado con status 201
     *
     * @param UsuarioRequest $request Datos validados del usuario: nick, nombre, email, password, avatar, banner, ubicacion, etc.
     * @return \Illuminate\Http\JsonResponse Usuario creado con todas sus propiedades
     *
     * @example
     * POST /api/usuarios
     * Body: {
     *   nick: "dj_nuevo",
     *   nombre: "DJ Nuevo Usuario",
     *   email: "djnuevo@example.com",
     *   password: "securePassword123",
     *   ubicacion: "Madrid, Spain",
     *   biografia: "Electronic music enthusiast",
     *   avatar: <File>,
     *   banner: <File>
     * }
     * Response: { id, nick, nombre, email, avatar, banner, ubicacion, created_at, ... }
     */
    public function store(UsuarioRequest $request)
    {
        $data = $request->validated();

        // Encriptar contraseña si se proporciona
        if (isset($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        }

        // Procesar y guardar avatar
        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        // Procesar y guardar banner
        if ($request->hasFile('banner')) {
            $data['banner'] = $request->file('banner')->store('banners', 'public');
        }

        $usuario = Usuario::create($data);

        return response()->json($usuario, 201);
    }

    /**
     * Obtiene los detalles completos de un usuario específico
     *
     * Carga perfil completo incluyendo:
     * - Datos de perfil: nick, nombre, email, ubicación, avatar, banner, biografía
     * - Redes sociales: twitter, instagram, youtube, spotify, tiktok, soundcloud
     * - Contenido creado: canciones, colecciones, playlists
     * - Equipamiento: softwares, hardwares
     * - Contenido del usuario: eventos, galerías
     * - Relaciones sociales: seguidores, seguidos
     *
     * @param string $id ID del usuario
     * @return \Illuminate\Http\JsonResponse Perfil completo del usuario con todas sus relaciones
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si el usuario no existe
     *
     * @example
     * GET /api/usuarios/1
     * Response: {
     *   id: 1,
     *   nick: "dj_master",
     *   nombre: "DJ Master",
     *   email: "master@example.com",
     *   ubicacion: "Barcelona",
     *   latitud: 41.3851,
     *   longitud: 2.1734,
     *   avatar: "avatars/...",
     *   banner: "banners/...",
     *   biografia: "Electronic music producer",
     *   twitter: "@djmaster",
     *   instagram: "@djmaster",
     *   youtube: "DJ Master",
     *   spotify: "DJMaster",
     *   seguidores: [{id, nick, avatar}, ...],
     *   seguidos: [{id, nick, avatar}, ...],
     *   canciones: [{id, titulo, duracion, ...}, ...],
     *   colecciones: [{id, titulo, artista, ...}, ...],
     *   playlists: [{id, titulo, descripcion, ...}, ...],
     *   softwares: [{id, nombre, ...}, ...],
     *   hardwares: [{id, nombre, cantidad, ...}, ...],
     *   eventos: [{id, nombre, fecha, ...}, ...],
     *   galeria: [{id, titulo, imagen, ...}, ...]
     * }
     */
    public function show(string $id)
    {
        $usuario = Usuario::select('id', 'nick', 'nombre', 'email', 'ubicacion', 'latitud', 'longitud', 'avatar', 'banner', 'biografia', 'twitter', 'instagram', 'youtube', 'spotify', 'tiktok', 'soundcloud')
            ->with(['seguidores', 'seguidos', 'canciones', 'colecciones', 'playlists', 'softwares', 'hardwares', 'eventos', 'galeria'])
            ->findOrFail($id);

        return response()->json($usuario, 200);
    }

    /**
     * Actualiza los datos de un usuario existente
     *
     * Permite actualizar:
     * - Datos básicos: nick, nombre, email, ubicación, biografía
     * - Contraseña (se encripta automáticamente)
     * - Avatar y banner (se almacenan en storage)
     * - Redes sociales: twitter, instagram, youtube, spotify, tiktok, soundcloud
     *
     * Proceso:
     * 1. Valida datos usando UsuarioRequest
     * 2. Encripta nueva contraseña si se proporciona
     * 3. Procesa nuevo avatar si se proporciona (reemplaza anterior)
     * 4. Procesa nuevo banner si se proporciona (reemplaza anterior)
     * 5. Actualiza registro en base de datos
     * 6. Retorna respuesta con usuario actualizado
     *
     * @param UsuarioRequest $request Datos a actualizar (validados)
     * @param Usuario $usuario Usuario a actualizar (inyectado por ruta)
     * @return \Illuminate\Http\JsonResponse Respuesta con status 200 y usuario actualizado
     *
     * @example
     * PUT /api/usuarios/1
     * Body: {
     *   nombre: "DJ Master Actualizado",
     *   biografia: "New biography",
     *   twitter: "@newtwitter",
     *   avatar: <File>,
     *   password: "newPassword123"
     * }
     * Response: {
     *   error: false,
     *   message: "Usuario actualizado con éxito",
     *   usuario: {id, nick, nombre, email, avatar, biografia, ...}
     * }
     */
    public function update(UsuarioRequest $request, Usuario $usuario)
    {
        $validated = $request->validated();

        // Filtrar valores null para evitar sobrescribir campos requeridos
        $validated = array_filter($validated, function($value) {
            return $value !== null;
        });

        // Encriptar contraseña si se proporciona
        if (isset($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        }

        // Procesar nuevo avatar si se proporciona
        if ($request->hasFile('avatar')) {
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        // Procesar nuevo banner si se proporciona
        if ($request->hasFile('banner')) {
            $validated['banner'] = $request->file('banner')->store('banners', 'public');
        }

        $usuario->update($validated);

        return response()->json([
            'error' => false,
            'message' => 'Usuario actualizado con éxito',
            'usuario' => $usuario
        ], 200);
    }

    /**
     * Elimina un usuario de la base de datos
     *
     * @param string $id ID del usuario a eliminar
     * @return \Illuminate\Http\JsonResponse Respuesta vacía con status 204
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si el usuario no existe
     *
     * @example
     * DELETE /api/usuarios/1
     * Response: (empty, status 204 No Content)
     */
    public function destroy(string $id)
    {
        $usuario = Usuario::findOrFail($id);
        $usuario->delete();

        return response()->json(null, 204);
    }

    /**
     * Actualiza el equipamiento (software y hardware) del usuario autenticado
     *
     * Permite sincronizar listas de software y hardware asociados al usuario.
     * El hardware incluye cantidad (cuántas unidades posee de cada tipo).
     *
     * Proceso:
     * 1. Obtiene usuario autenticado desde token
     * 2. Valida arrays de IDs contra tabla global de software y hardware
     * 3. Usa sync() para actualizar tablas pivot de forma atómica:
     *    - Inserta nuevos registros
     *    - Elimina registros no incluidos en los IDs
     * 4. Para hardware: construye array con cantidades (pivot table)
     *    - Valor por defecto: 1 unidad
     *    - Mínimo: 1 unidad (max(1, cantidad))
     * 5. Retorna relaciones actualizadas
     *
     * @param Request $request Datos con:
     *   - software_ids: array de IDs de software (nullable)
     *   - hardware_ids: array de IDs de hardware (nullable)
     *   - hardware_cantidades: object {id_hardware: cantidad, ...} (nullable)
     * @return \Illuminate\Http\JsonResponse Respuesta con softwares y hardwares actualizados
     *
     * @example
     * POST /api/usuarios/equipamiento
     * Headers: Authorization: Bearer {token}
     * Body: {
     *   software_ids: [1, 2, 3],
     *   hardware_ids: [10, 15],
     *   hardware_cantidades: { 10: 2, 15: 1 }
     * }
     * Response: {
     *   error: false,
     *   mensaje: "¡Equipamiento actualizado con éxito!",
     *   softwares: [{id, nombre, ...}, {id, nombre, ...}, ...],
     *   hardwares: [{id, nombre, cantidad: 2, ...}, {id, nombre, cantidad: 1, ...}]
     * }
     */
    public function actualizarEquipamiento(Request $request)
    {
        // Obtener usuario autenticado a través del token Sanctum
        $usuario = $request->user();

        // Validar que los arrays contengan IDs válidos que existan en las tablas globales
        $request->validate([
            'software_ids'   => 'nullable|array',
            'software_ids.*' => 'integer|exists:software,id',
            'hardware_ids'   => 'nullable|array',
            'hardware_ids.*' => 'integer|exists:hardware,id',
            'hardware_cantidades'   => 'nullable|array',
            'hardware_cantidades.*' => 'integer|min:1',
        ]);

        // Sincronizar software: reemplazar completamente la lista
        if ($request->has('software_ids')) {
            $usuario->softwares()->sync($request->software_ids);
        }

        // Sincronizar hardware con cantidades en la tabla pivot
        if ($request->has('hardware_ids')) {
            // Construir array para sync() incluyendo cantidades
            // Formato: [id => ['cantidad' => valor], ...]
            $cantidades = $request->input('hardware_cantidades', []);
            $datosSync = collect($request->hardware_ids)->mapWithKeys(function ($idHardware) use ($cantidades) {
                $cantidad = isset($cantidades[$idHardware]) ? max(1, (int) $cantidades[$idHardware]) : 1;
                return [$idHardware => ['cantidad' => $cantidad]];
            })->all();

            $usuario->hardwares()->sync($datosSync);
        }

        // Retornar equipamiento actualizado para React (con todos los campos incluyendo imagen)
        return response()->json([
            'error' => false,
            'mensaje' => '¡Equipamiento actualizado con éxito!',
            'softwares' => $usuario->softwares()->select('id', 'nombre', 'distribuidor', 'imagen', 'precio', 'tipo_pago', 'version')->get(),
            'hardwares' => $usuario->hardwares()->select('id', 'nombre', 'marca', 'imagen', 'precio', 'descripcion')->withPivot('cantidad')->get()
        ], 200);
    }
}
