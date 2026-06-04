<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;

/**
 * PlaylistRequest - Validación de datos para operaciones con playlists
 *
 * Valida y procesa datos de creación y actualización de playlists incluyendo:
 * - Metadatos: título, descripción, privacidad
 * - Fecha de publicación: año de creación (4 dígitos)
 * - Propietario: usuario creador (requerido en creación)
 * - Archivos: portada/imagen de la playlist
 * - Reglas diferentes para creación vs edición (portada obligatoria vs opcional)
 * - Validación personalizada: usuario no puede ser colaborador de su propia playlist
 *
 * @package App\Http\Requests
 */
class PlaylistRequest extends FormRequest
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
     * Handle a failed validation attempt
     *
     * @param Validator $validator
     * @return void
     */
    protected function failedValidation(Validator $validator)
    {
        throw new \Illuminate\Validation\ValidationException(
            $validator,
            response()->json([
                'error' => true,
                'message' => 'Error de validación',
                'detalles' => $validator->errors()->toArray(),
            ], 422)
        );
    }

    /**
     * Procesa los datos de la solicitud antes de validación
     *
     * Convierte JSON strings a arrays para colaboradores,
     * permitiendo que el frontend envíe datos como JSON o arrays.
     *
     * @return void
     */
    protected function prepareForValidation()
    {
        // Convertir JSON string de colaboradores a array si es necesario
        if ($this->has('colaboradores') && is_string($this->colaboradores)) {
            $this->merge([
                'colaboradores' => json_decode($this->colaboradores, true) ?? []
            ]);
        }
    }

    /**
     * Validaciones adicionales después de pasar las reglas básicas
     *
     * Verifica que el usuario actual no esté incluido en la lista de colaboradores.
     * Un usuario no puede ser creador y colaborador de la misma playlist.
     *
     * @param \Illuminate\Validation\Validator $validator Instancia del validador
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $colaboradores = $this->input('colaboradores', []);
            $usuario = auth()->user();

            // Si no hay usuario autenticado, no hacer validación
            if (!$usuario) {
                return;
            }

            // Convertir a array si es string JSON (por si acaso)
            if (is_string($colaboradores)) {
                $colaboradores = json_decode($colaboradores, true) ?? [];
            }

            // Verificar si usuario actual está en colaboradores
            if (is_array($colaboradores)) {
                $colaboradores = array_map('intval', $colaboradores);

                if (in_array($usuario->id, $colaboradores)) {
                    $validator->errors()->add('colaboradores', 'Ya participas en este proyecto');
                }
            }
        });
    }

    /**
     * Define las reglas de validación para la playlist.
     *
     * Validaciones:
     * - titulo: requerido, string, máx 255 caracteres
     * - descripcion: opcional, string, máx 200 caracteres
     * - privacidad: requerido, debe ser publica o privada
     * - fecha_publicacion: requerido, año (4 dígitos)
     * - portada: requerida en POST (creación), opcional en PUT (edición)
     * - id_usuario: requerido en POST (creación), no validado en PUT
     * - colaboradores: opcional, array de IDs que existen en tabla usuarios
     *
     * @return array Reglas de validación
     */
    public function rules(): array
    {
        $rules = [
            'titulo'            => 'required|string|max:255',
            'descripcion'       => 'nullable|string|max:200',
            'privacidad'        => 'required|in:publica,privada',
            'fecha_publicacion' => 'required|integer|digits:4',
            'colaboradores'     => 'nullable|array',
            'colaboradores.*'   => 'integer|exists:usuarios,id',
        ];

        // Reglas específicas por método HTTP
        if ($this->isMethod('post')) {
            // Creación (POST): exigir usuario y portada obligatorios
            $rules['id_usuario'] = 'required|integer|exists:usuarios,id';
            $rules['portada']    = 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048';
        } else {
            // Edición (PUT/PATCH): portada opcional
            $rules['portada']    = 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048';
            // id_usuario no se valida en edición porque ya existe en BD
        }

        return $rules;
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
            // Título
            'titulo.required'     => 'Título requerido',
            'titulo.string'       => 'Título debe ser texto',
            'titulo.max'          => 'Título muy largo (máx 255)',

            // Descripción
            'descripcion.string'  => 'Descripción debe ser texto',
            'descripcion.max'     => 'Descripción muy larga (máx 200)',

            // Privacidad
            'privacidad.required' => 'Privacidad requerida',
            'privacidad.in'       => 'Privacidad: pública o privada',

            // Fecha de publicación
            'fecha_publicacion.required' => 'Año requerido',
            'fecha_publicacion.integer'  => 'Año debe ser número',
            'fecha_publicacion.digits'   => 'Año: 4 dígitos (ej: 2026)',

            // Usuario
            'id_usuario.required' => 'Usuario requerido',
            'id_usuario.exists'   => 'Usuario no válido',

            // Colaboradores
            'colaboradores.array' => 'Colaboradores debe ser array',
            'colaboradores.*.integer' => 'Colaborador ID inválido',
            'colaboradores.*.exists'  => 'Colaborador no existe',

            // Portada
            'portada.required'    => 'Portada requerida',
            'portada.image'       => 'Debe ser una imagen',
            'portada.mimes'       => 'Formato: JPEG, PNG, JPG, GIF o WebP',
            'portada.max'         => 'Imagen muy grande (máx 2MB)',
        ];
    }
}