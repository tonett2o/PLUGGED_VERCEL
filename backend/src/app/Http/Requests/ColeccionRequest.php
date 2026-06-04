<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;

/**
 * ColeccionRequest - Validación de datos para operaciones con colecciones
 *
 * Valida y procesa datos de creación y actualización de colecciones (álbumes, EPs) incluyendo:
 * - Metadatos: título, artista, descripción, tipo
 * - Privacidad: pública o privada
 * - Fecha de publicación: año de lanzamiento (4 dígitos)
 * - Propietario: usuario creador (requerido en creación)
 * - Archivos: portada/carátula (imagen)
 * - Relaciones: colaboradores (múltiples usuarios)
 * - Conversión de JSON strings a arrays para colaboradores
 * - Reglas diferentes para creación vs edición (portada obligatoria vs opcional)
 *
 * @package App\Http\Requests
 */
class ColeccionRequest extends FormRequest
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
     * Procesa los datos de la solicitud antes de validación.
     *
     * Convierte JSON strings a arrays para relaciones many-to-many.
     * Permite que el frontend envíe datos como JSON o arrays directamente.
     *
     * @return void
     */
    protected function prepareForValidation(): void
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
     * Un usuario no puede ser creador y colaborador de la misma colección.
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
     * Define las reglas de validación para la colección.
     *
     * Validaciones:
     * - titulo: requerido, string, máx 255 caracteres
     * - artista: opcional, string, máx 255 caracteres
     * - tipo: requerido, debe ser album o ep
     * - privacidad: requerido, debe ser publica o privada
     * - fecha_publicacion: requerido, año (4 dígitos)
     * - colaboradores: opcional, array de IDs de usuarios válidos
     * - portada: requerida en POST (creación), opcional en PUT (edición)
     * - id_usuario: requerido en POST (creación), no validado en PUT
     *
     * @return array Reglas de validación
     */
    public function rules(): array
    {
        // Reglas base que se aplican en ambos casos (creación y edición)
        $rules = [
            'titulo'            => 'required|string|max:255',
            'artista'           => 'nullable|string|max:255',
            'descripcion'       => 'nullable|string|max:1000',
            'tipo'              => 'required|in:album,ep',
            'privacidad'        => 'required|in:publica,privada',
            'fecha_publicacion' => 'required|integer|digits:4',
            'colaboradores'     => 'nullable|array',
            'colaboradores.*'   => 'integer|exists:usuarios,id'
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
            'titulo.required'    => 'Título requerido',
            'titulo.string'      => 'Título debe ser texto',
            'titulo.max'         => 'Título muy largo (máx 255)',

            // Artista
            'artista.string'     => 'Artista debe ser texto',
            'artista.max'        => 'Artista muy largo (máx 255)',

            // Descripción
            'descripcion.string' => 'Descripción debe ser texto',
            'descripcion.max'    => 'Descripción muy larga (máx 1000)',

            // Tipo
            'tipo.required'      => 'Tipo requerido',
            'tipo.in'            => 'Tipo: album o ep',

            // Privacidad
            'privacidad.required' => 'Privacidad requerida',
            'privacidad.in'      => 'Privacidad: pública o privada',

            // Fecha de publicación
            'fecha_publicacion.required' => 'Año requerido',
            'fecha_publicacion.integer'  => 'Año debe ser número',
            'fecha_publicacion.digits'   => 'Año: 4 dígitos (ej: 2025)',

            // ID Usuario
            'id_usuario.required' => 'Usuario requerido',
            'id_usuario.exists'   => 'Usuario no válido',

            // Colaboradores
            'colaboradores.array' => 'Colaboradores debe ser array',
            'colaboradores.*.integer' => 'Colaborador ID inválido',
            'colaboradores.*.exists'  => 'Colaborador no existe',

            // Portada
            'portada.required'   => 'Portada requerida',
            'portada.image'      => 'Debe ser una imagen',
            'portada.mimes'      => 'Formato: JPEG, PNG, JPG, GIF o WebP',
            'portada.max'        => 'Imagen muy grande (máx 2MB)',
        ];
    }
}