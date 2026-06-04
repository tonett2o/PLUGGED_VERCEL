<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * ComentarioRequest - Validación de datos para operaciones con comentarios
 *
 * Valida y procesa datos de creación de comentarios en canciones incluyendo:
 * - Texto del comentario: contenido del mensaje
 * - Segundo: timestamp/posición en la canción donde se ancla el comentario
 * - Longitud limitada para mensajes concisos
 * - Anclaje temporal para permitir comentarios en puntos específicos
 *
 * @package App\Http\Requests
 */
class ComentarioRequest extends FormRequest
{
    /**
     * Autoriza la solicitud para todos los usuarios.
     *
     * @return bool True (autorizar a todos)
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Define las reglas de validación para el comentario.
     *
     * Validaciones:
     * - texto: requerido, string, máx 500 caracteres (mensaje del comentario)
     * - segundo: requerido, entero no negativo (posición temporal en canción)
     *
     * @return array Reglas de validación
     */
    public function rules(): array
    {
        return [
            'texto'   => 'required|string|max:500',
            'segundo' => 'required|integer|min:0',
        ];
    }

    /**
     * Mensajes de error personalizados para validación.
     *
     * Proporciona mensajes en español para cada regla de validación,
     * mejorando la experiencia del usuario con errores claros.
     *
     * @return array Mensajes de error personalizados
     */
    public function messages(): array
    {
        return [
            'texto.required'   => 'El comentario no puede estar vacío.',
            'texto.max'        => 'El comentario no puede superar los 500 caracteres.',
            'segundo.required' => 'Falta el segundo de la canción para anclar el comentario.',
            'segundo.integer'  => 'El segundo debe ser un número entero.',
            'segundo.min'      => 'El segundo debe ser un valor positivo.',
        ];
    }
}
