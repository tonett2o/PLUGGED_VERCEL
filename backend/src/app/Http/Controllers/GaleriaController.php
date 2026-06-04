<?php

namespace App\Http\Controllers;

use App\Models\ImagenGaleria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * GaleriaController - Gestión de galerías de imágenes de usuarios
 *
 * Controla las operaciones de galería incluyendo:
 * - Subir imágenes a la galería personal del usuario
 * - Validación de tipos de imagen (JPEG, PNG, WebP, GIF)
 * - Límite de tamaño de archivo (8MB)
 * - Eliminar imágenes (solo el propietario)
 * - Limpiar archivos físicos al eliminar registros
 *
 * @package App\Http\Controllers
 */
class GaleriaController extends Controller
{
    /**
     * Sube una nueva imagen a la galería del usuario autenticado
     *
     * Proceso:
     * 1. Obtiene usuario autenticado
     * 2. Valida que el archivo sea una imagen
     * 3. Verifica formato (JPEG, PNG, WebP, GIF) y tamaño (max 8MB)
     * 4. Almacena imagen en storage/public/galeria/
     * 5. Crea registro en base de datos
     * 6. Retorna imagen creada
     *
     * Validaciones:
     * - Archivo es requerido
     * - Debe ser una imagen válida
     * - Formatos aceptados: JPEG, PNG, JPG, WebP, GIF
     * - Tamaño máximo: 8MB
     *
     * @param Request $request Debe contener archivo 'imagen'
     * @return JsonResponse Imagen creada o errores de validación
     *
     * @example
     * POST /api/galeria
     * Headers: Authorization: Bearer {token}
     * Body (FormData): {
     *   imagen: <File.jpg>
     * }
     * Response: {
     *   error: false,
     *   mensaje: "Imagen subida con éxito",
     *   imagen: {
     *     id: 1,
     *     id_usuario: 2,
     *     imagen: "galeria/abc123.jpg",
     *     created_at: "2026-05-27T10:30:00Z"
     *   }
     * }
     */
    public function store(Request $request)
    {
        // Paso 1: Obtener usuario autenticado
        $usuario = $request->user();

        // Paso 2 & 3: Validar imagen
        $request->validate([
            'imagen' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:8192', // máximo 8MB
        ]);

        // Paso 4: Almacenar archivo en storage
        $ruta = $request->file('imagen')->store('galeria', 'public');

        // Paso 5: Crear registro en base de datos
        $imagen = ImagenGaleria::create([
            'id_usuario' => $usuario->id,
            'imagen'     => $ruta,
        ]);

        // Paso 6: Retornar imagen creada
        return response()->json([
            'error'   => false,
            'mensaje' => 'Imagen subida con éxito',
            'imagen'  => $imagen,
        ], 201);
    }

    /**
     * Elimina una imagen de la galería del usuario
     *
     * Solo el propietario de la imagen puede eliminarla.
     * Elimina tanto el archivo físico como el registro en base de datos.
     *
     * Proceso:
     * 1. Obtiene usuario autenticado
     * 2. Verifica que usuario es propietario de la imagen
     * 3. Elimina archivo físico del storage (si existe)
     * 4. Elimina registro de base de datos
     * 5. Retorna respuesta 204 (sin contenido)
     *
     * @param Request $request Requiere usuario autenticado
     * @param ImagenGaleria $imagen Imagen a eliminar (inyectada por ruta)
     * @return JsonResponse Respuesta vacía con status 204 o error 403
     *
     * @example
     * DELETE /api/galeria/1
     * Headers: Authorization: Bearer {token}
     * Response: (empty, status 204 No Content)
     *
     * @example
     * DELETE /api/galeria/1 (usuario no es el propietario)
     * Response: {
     *   error: true,
     *   mensaje: "No tienes permiso para eliminar esta imagen."
     * } (403)
     */
    public function destroy(Request $request, ImagenGaleria $imagen)
    {
        // Paso 1: Obtener usuario autenticado
        $usuario = $request->user();

        // Paso 2: Verificar que usuario es propietario
        if ($imagen->id_usuario !== $usuario->id) {
            return response()->json([
                'error'   => true,
                'mensaje' => 'No tienes permiso para eliminar esta imagen.',
            ], 403);
        }

        // Paso 3: Eliminar archivo físico del storage
        if ($imagen->imagen && Storage::disk('public')->exists($imagen->imagen)) {
            Storage::disk('public')->delete($imagen->imagen);
        }

        // Paso 4: Eliminar registro de base de datos
        $imagen->delete();

        // Paso 5: Retornar respuesta 204
        return response()->json(null, 204);
    }
}
