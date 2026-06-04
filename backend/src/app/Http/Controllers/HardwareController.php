<?php
namespace App\Http\Controllers;

use App\Models\Hardware;
use App\Http\Requests\HardwareRequest;
use Illuminate\Http\Request;

/**
 * HardwareController - Gestión de equipamiento de hardware
 *
 * Controla las operaciones CRUD para equipamiento de hardware (sintetizadores,
 * controladores MIDI, monitores, etc.) incluyendo:
 * - Listar todo el hardware disponible en el sistema
 * - Crear nuevo hardware
 * - Ver detalles de hardware específico
 * - Actualizar información de hardware
 * - Eliminar hardware
 * - Cargar relaciones: usuarios que poseen este hardware
 *
 * @package App\Http\Controllers
 */
class HardwareController extends Controller
{
    /**
     * Obtiene la lista completa de hardware disponible
     *
     * Usa eager loading para evitar consultas N+1 al cargar usuarios.
     *
     * @return \Illuminate\Http\JsonResponse Array de hardware
     *
     * @example
     * GET /api/hardware
     * Response: [{
     *   id: 1,
     *   nombre: "Synthesizer Pro",
     *   marca: "Korg",
     *   precio: 1500,
     *   imagen: "hardware/synth.jpg",
     *   descripcion: "Professional synthesizer",
     *   usuarios: [{id, nick, avatar}, ...]
     * }, ...]
     */
    public function index()
    {
        // Eager loading para evitar consultas N+1
        $hardwares = Hardware::with(['usuarios'])
            ->select('id','nombre','marca','precio','imagen','descripcion')
            ->get();

        return response()->json($hardwares, 200);
    }

    /**
     * Crea nuevo hardware en el sistema
     *
     * @param HardwareRequest $request Datos validados: nombre, marca, precio, imagen, descripcion
     * @return \Illuminate\Http\JsonResponse Hardware creado
     *
     * @example
     * POST /api/hardware
     * Body: {
     *   nombre: "Synthesizer Pro",
     *   marca: "Korg",
     *   precio: 1500,
     *   imagen: "...",
     *   descripcion: "Professional synthesizer"
     * }
     * Response: { id, nombre, marca, precio, ... }
     */
    public function store(HardwareRequest $request)
    {
        $hardware = Hardware::create($request->validated());
        return response()->json($hardware, 201);
    }

    /**
     * Obtiene detalles de un hardware específico
     *
     * @param string $id ID del hardware
     * @return \Illuminate\Http\JsonResponse Detalles del hardware con usuarios
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si no existe
     *
     * @example
     * GET /api/hardware/1
     * Response: {
     *   id: 1,
     *   nombre: "Synthesizer Pro",
     *   marca: "Korg",
     *   precio: 1500,
     *   imagen: "hardware/synth.jpg",
     *   descripcion: "Professional synthesizer",
     *   usuarios: [{id, nick, avatar}, ...]
     * }
     */
    public function show(string $id)
    {
        $hardware = Hardware::with(['usuarios'])
            ->select('id','nombre','marca','precio','imagen','descripcion')
            ->findOrFail($id);

        return response()->json($hardware, 200);
    }

    /**
     * Actualiza información de un hardware
     *
     * @param HardwareRequest $request Datos a actualizar
     * @param string $id ID del hardware
     * @return \Illuminate\Http\JsonResponse Hardware actualizado
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si no existe
     *
     * @example
     * PUT /api/hardware/1
     * Body: { nombre: "Synthesizer Pro Updated", precio: 1400 }
     * Response: { id, nombre, marca, precio, ... }
     */
    public function update(HardwareRequest $request, string $id)
    {
        $hardware = Hardware::findOrFail($id);
        $hardware->update($request->validated());

        return response()->json($hardware, 200);
    }

    public function topHardware()
    {
        $hardware = Hardware::query()
            ->select('id', 'nombre', 'marca', 'imagen', 'descripcion')
            ->withCount('usuarios')
            ->orderByDesc('usuarios_count')
            ->limit(50)
            ->get();

        return response()->json($hardware, 200);
    }

    /**
     * Elimina un hardware del sistema
     *
     * @param string $id ID del hardware a eliminar
     * @return \Illuminate\Http\JsonResponse Respuesta vacía con status 204
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException Si no existe
     *
     * @example
     * DELETE /api/hardware/1
     * Response: (empty, status 204 No Content)
     */
    public function destroy(string $id)
    {
        $hardware = Hardware::findOrFail($id);
        $hardware->delete();

        return response()->json(null, 204);
    }
}