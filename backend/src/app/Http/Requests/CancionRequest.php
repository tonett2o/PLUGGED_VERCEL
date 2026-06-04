<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;

/**
 * CancionRequest - Validación de datos para operaciones con canciones
 *
 * Valida y procesa datos de creación y actualización de canciones incluyendo:
 * - Metadatos: título, BPM, tonalidad, estilo, privacidad
 * - Relaciones: colección, playlist, usuario, colaboradores
 * - Archivos: audio (MP3, WAV), portada
 * - Conversión de JSON strings a arrays para colaboradores
 * - Reglas diferentes para creación vs edición (archivo obligatorio vs opcional)
 *
 * @package App\Http\Requests
 */
class CancionRequest extends FormRequest
{
    /**
     * Autoriza la solicitud para todos los usuarios
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
     * Convierte JSON strings a arrays para relaciones many-to-many.
     *
     * @return void
     */
    protected function prepareForValidation()
    {
        \Log::info('📝 CancionRequest prepareForValidation:', [
            'has_archivo' => $this->hasFile('archivo'),
            'archivo' => $this->file('archivo'),
            'all_files' => $this->allFiles(),
            'all_input_keys' => array_keys($this->all())
        ]);

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
     * Un usuario no puede ser creador y colaborador de la misma canción.
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
     * Define las reglas de validación para la canción
     *
     * @return array Reglas de validación
     */
    public function rules()
    {
        // 1. Reglas comunes
        $rules = [
            'titulo'            => 'required|string|max:255',
            'bpm'               => 'nullable|integer|min:20|max:300',
            'tonalidad'         => 'nullable|string|max:50',
            'id_coleccion'      => 'nullable|integer',
            'id_playlist'       => 'nullable|integer',
            'id_usuario'        => 'nullable|integer',
            'fecha_publicacion' => 'nullable|string',
            'estilo'            => 'nullable|string|max:100',
            'privacidad'        => 'nullable|in:publica,privada',
            'colaboradores'     => 'nullable|array',
            'colaboradores.*'   => 'integer|exists:usuarios,id'
        ];

        // Archivo: obligatorio en creación (POST), opcional en edición (PUT)
        if ($this->isMethod('post')) {
            // Creación: archivo de audio es obligatorio
            $rules['archivo'] = 'required|file|mimes:mp3,wav,mpeg|max:45000';
            // Creación: portada es opcional
            $rules['portada'] = 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048';
        } else {
            // Edición: archivo y portada son opcionales
            $rules['archivo'] = 'nullable|file|mimes:mp3,wav,mpeg|max:45000';
            $rules['portada'] = 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048';
        }

        return $rules;
    }

    /**
     * Mensajes de error personalizados para validación
     *
     * @return array Mensajes de error en español
     */
    public function messages(): array
    {
        return [
            // Título
            'titulo.required'  => 'Título requerido',
            'titulo.string'    => 'Título debe ser texto',
            'titulo.max'       => 'Título muy largo (máx 255)',

            // Archivo (Audio)
            'archivo.required' => 'Archivo de audio requerido',
            'archivo.file'     => 'Archivo no válido',
            'archivo.mimes'    => 'Formato: MP3 o WAV',
            'archivo.max'      => 'Archivo muy grande (máx 45MB)',

            // Portada (Imagen)
            'portada.image'    => 'Debe ser una imagen',
            'portada.mimes'    => 'Formato: JPEG, PNG, JPG, GIF o WebP',
            'portada.max'      => 'Imagen muy grande (máx 2MB)',

            // BPM
            'bpm.integer'      => 'BPM debe ser número',
            'bpm.min'          => 'BPM mínimo 20',
            'bpm.max'          => 'BPM máximo 300',

            // Tonalidad
            'tonalidad.string' => 'Tonalidad debe ser texto',
            'tonalidad.max'    => 'Tonalidad muy larga (máx 50)',

            // Estilo
            'estilo.string'    => 'Estilo debe ser texto',
            'estilo.max'       => 'Estilo muy largo (máx 100)',

            // Privacidad
            'privacidad.in'    => 'Privacidad: pública o privada',

            // Colaboradores
            'colaboradores.array'     => 'Colaboradores debe ser array',
            'colaboradores.*.integer' => 'Colaborador ID inválido',
            'colaboradores.*.exists'  => 'Colaborador no existe',

            // Colección
            'id_coleccion.integer'    => 'Colección ID inválido',

            // Playlist
            'id_playlist.integer'     => 'Playlist ID inválido',

            // Usuario
            'id_usuario.integer'      => 'Usuario ID inválido',

            // Fecha
            'fecha_publicacion.string' => 'Fecha no válida',
        ];
    }
}