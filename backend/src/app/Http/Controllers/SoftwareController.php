<?php

namespace App\Http\Controllers;

use App\Models\Software;
use App\Http\Requests\SoftwareRequest;
use Illuminate\Http\Request;

/**
 * SoftwareController - Gestión de equipamiento de software
 *
 * Controla las operaciones CRUD para equipamiento de software (DAW, plugins,
 * sintetizadores virtuales, etc.) incluyendo:
 * - Listar todo el software disponible en el sistema
 * - Crear nuevo software
 * - Ver detalles de software específico
 * - Actualizar información de software
 * - Eliminar software
 * - Cargar relaciones: usuarios que poseen este software
 *
 * @package App\Http\Controllers
 */
class SoftwareController extends Controller
{
    /**
     * Obtiene la lista completa de software disponible
     *
     * Usa eager loading para evitar consultas N+1 al cargar usuarios.
     *
     * @return \Illuminate\Http\JsonResponse Array de software
     *
     * @example
     * GET /api/software
     * Response: [{
     *   id: 1,
     *   nombre: "Ableton Live",
     *   version: "12.0",
     *   distribuidor: "Ableton",
     *   precio: 599,
     *   tipo_pago: "perpetual",
     *   imagen: "software/ableton.jpg",
     *   descripcion: "Professional DAW",
     *   usuarios: [{id, nick, avatar}, ...]
     * }, ...]
     */
    public function index()
    {
        // Eager loading para evitar consultas N+1
        $softwares = Software::with(['usuarios'])
            ->select('id','nombre', 'version', 'distribuidor','precio','tipo_pago','imagen','descripcion')
            ->get();

        return response()->json($softwares, 200);
    }

    /**
     * Crea nuevo software en el sistema
     *
     * @param SoftwareRequest $request Datos validados: nombre, version, distribuidor, precio, tipo_pago, imagen, descripcion
     * @return \Illuminate\Http\JsonResponse Software creado
     *
     * @example
     * POST /api/software
     * Body: {
     *   nombre: "Ableton Live",
     *   version: "12.0",
     *   distribuidor: "Ableton",
     *   precio: 599,
     *   tipo_pago: "perpetual",
     *   imagen: "...",
     *   descripcion: "Professional DAW"
     * }
     * Response: { id, nombre, version, distribuidor, precio, ... }
     */
    public function store(SoftwareRequest $request)
    {
        $software = Software::create($request->validated());
        return response()->json($software, 201);
    }

    /**
     * Obtiene detalles de un software específico
     *
     * @param string $id ID del software
     * @return \Illuminate\Http\JsonResponse Detalles del software con usuarios
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si no existe
     *
     * @example
     * GET /api/software/1
     * Response: {
     *   id: 1,
     *   nombre: "Ableton Live",
     *   version: "12.0",
     *   distribuidor: "Ableton",
     *   precio: 599,
     *   tipo_pago: "perpetual",
     *   imagen: "software/ableton.jpg",
     *   descripcion: "Professional DAW",
     *   usuarios: [{id, nick, avatar}, ...]
     * }
     */
    public function show(string $id)
    {
        $software = Software::with(['usuarios'])
            ->select('id','nombre', 'version', 'distribuidor','precio','tipo_pago','imagen','descripcion')
            ->findOrFail($id);

        return response()->json($software, 200);
    }

    /**
     * Actualiza información de un software
     *
     * @param SoftwareRequest $request Datos a actualizar
     * @param string $id ID del software
     * @return \Illuminate\Http\JsonResponse Software actualizado
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si no existe
     *
     * @example
     * PUT /api/software/1
     * Body: { version: "12.1", precio: 599 }
     * Response: { id, nombre, version, distribuidor, precio, ... }
     */
    public function update(SoftwareRequest $request, string $id)
    {
        $software = Software::findOrFail($id);
        $software->update($request->validated());

        return response()->json($software, 200);
    }

    public function topSoftware()
    {
        $software = Software::query()
            ->select('id', 'nombre', 'distribuidor', 'imagen', 'descripcion')
            ->withCount('usuarios')
            ->orderByDesc('usuarios_count')
            ->limit(50)
            ->get();

        return response()->json($software, 200);
    }

    /**
     * Elimina un software del sistema
     *
     * @param string $id ID del software a eliminar
     * @return \Illuminate\Http\JsonResponse Respuesta vacía con status 204
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si no existe
     *
     * @example
     * DELETE /api/software/1
     * Response: (empty, status 204 No Content)
     */
    public function destroy(string $id)
    {
        $software = Software::findOrFail($id);
        $software->delete();

        return response()->json(null, 204);
    }
}
