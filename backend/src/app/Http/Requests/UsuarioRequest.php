<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Contracts\Validation\Validator;
use App\Rules\ValidEmail;

/**
 * UsuarioRequest - Validación de datos para operaciones con usuarios
 *
 * Valida y procesa datos de creación y actualización de perfiles de usuario incluyendo:
 * - Autenticación: email único, password robusta, confirmación de contraseña
 * - Perfil: nick único, nombre, biografía, ubicación
 * - Ubicación: dirección, coordenadas geográficas (latitud, longitud)
 * - Redes sociales: Twitter, Instagram, YouTube, Spotify, TikTok, SoundCloud
 * - Archivos: avatar y banner (imágenes)
 * - Rol: usuario, dj, productor, admin
 * - Conversión de objeto ubicación JSON a coordenadas individuales
 * - Reglas diferentes para creación (POST) vs edición (PUT)
 *
 * Validaciones especiales:
 * - Password: mínimo 8 caracteres, mayúsculas, minúsculas, números, símbolos
 * - Email y nick: únicos en la base de datos (con excepción para edición del propio usuario)
 * - Ubicación: puede venir como JSON con {direccion, lat, lng} y se convierte a campos separados
 * - Imágenes: JPEG, PNG, WebP, máximo 2MB
 *
 * @package App\Http\Requests
 */
class UsuarioRequest extends FormRequest
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
     * Convierte la ubicación de formato JSON/objeto a campos separados:
     * - Si es JSON string: lo decodifica
     * - Si es array: extrae dirección, lat, lng
     * - Luego asigna estos valores a los campos individuales de la request
     *
     * Esto permite que el frontend pueda enviar un objeto de ubicación
     * y que se convierta automáticamente a los campos esperados.
     *
     * @return void
     */
    protected function prepareForValidation(): void
    {
        // Si ubicacion viene como JSON string o array, extrae las coordenadas
        $ubicacion = $this->input('ubicacion');
        if ($ubicacion) {
            if (is_string($ubicacion) && str_starts_with($ubicacion, '{')) {
                $ubicacion = json_decode($ubicacion, true);
            }

            if (is_array($ubicacion)) {
                $this->merge([
                    'ubicacion' => $ubicacion['direccion'] ?? '',
                    'latitud' => $ubicacion['lat'] ?? null,
                    'longitud' => $ubicacion['lng'] ?? null,
                ]);
            }
        }
    }

    /**
     * Define las reglas de validación para el usuario.
     *
     * Validaciones:
     * - nick: requerido en POST, único, máx 50 caracteres, solo alfanuméricos y guiones
     * - nombre: opcional, máx 255 caracteres
     * - email: requerido en POST, único, formato email válido
     * - password: requerido en POST, mínimo 8 caracteres robustos (mayúsc, minúsc, números, símbolos)
     *   - Debe tener confirmación (password_confirmation)
     * - ubicacion: opcional, máx 255 caracteres (dirección o descripción)
     * - latitud: opcional, número entre -90 y 90
     * - longitud: opcional, número entre -180 y 180
     * - rol: opcional, debe ser uno de: dj, productor, admin, usuario
     * - biografia: opcional, máx 1000 caracteres
     * - redes sociales: todas opcionales, máx 255 caracteres cada una
     * - avatar y banner: imágenes opcionales, JPEG/PNG/WebP, máximo 2MB
     *
     * Nota: En modo edición (PUT), email, nick, password se vuelven opcionales.
     *
     * @return array Reglas de validación
     */
    public function rules(): array
    {
        $usuarioId = $this->route('usuario') ? $this->route('usuario')->id : null;

        return [
            'nick'      => [
                $this->isMethod('post') ? 'required' : 'nullable',
                'string',
                'max:50',
                'regex:/^[a-zA-Z0-9_-]+$/',
                Rule::unique('usuarios')->ignore($usuarioId)
            ],
            'nombre'    => 'nullable|string|max:255',
            'email'     => [
                $this->isMethod('post') ? 'required' : 'nullable',
                new ValidEmail(),  // Validación robusta con DNS check
                Rule::unique('usuarios')->ignore($usuarioId)
            ],

            // Regla de password robusta (8+ chars, mayúsculas, minúsculas, números y símbolos)
            'password'  => $this->isMethod('post')
                ? ['required', 'min:8', 'confirmed', Password::defaults()]
                : ['nullable', 'min:8', 'confirmed', Password::defaults()],

            'password_confirmation' => 'nullable|same:password',

            'ubicacion' => 'nullable|string|max:255',
            'latitud' => 'nullable|numeric|between:-90,90',
            'longitud' => 'nullable|numeric|between:-180,180',
            'rol' => 'nullable|string|in:dj,productor,admin,usuario',
            'biografia' => 'nullable|string|max:1000',

            // Redes Sociales
            'twitter'    => 'nullable|string|max:255',
            'instagram'  => 'nullable|string|max:255',
            'youtube'    => 'nullable|string|max:255',
            'spotify'    => 'nullable|string|max:255',
            'tiktok'     => 'nullable|string|max:255',
            'soundcloud' => 'nullable|string|max:255',

            // Imágenes: 'image' valida que sea imagen, 'mimes' limita formato
            'avatar'    => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'banner'    => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
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
            // Nick
            'nick.required'      => 'Nick requerido',
            'nick.unique'        => 'Nick ya existe',
            'nick.max'           => 'Nick muy largo (máx 50)',
            'nick.regex'         => 'Nick: letras, números, - y _',

            // Nombre
            'nombre.max'         => 'Nombre muy largo (máx 255)',

            // Email
            'email.required'     => 'Email requerido',
            'email.valid_email'  => 'Email no válido o dominio no existe',
            'email.unique'       => 'Email ya registrado',

            // Password
            'password.required'  => 'Contraseña requerida',
            'password.min'       => 'Contraseña mínimo 8 caracteres',
            'password.confirmed' => 'Las contraseñas no coinciden',
            'password.regex'     => 'Contraseña: mayús, minús, números y símbolos',

            // Password Confirmation
            'password_confirmation.same' => 'Confirmación no coincide',

            // Ubicación
            'ubicacion.max'      => 'Ubicación muy larga (máx 255)',
            'latitud.numeric'    => 'Latitud debe ser número',
            'latitud.between'    => 'Latitud entre -90 y 90',
            'longitud.numeric'   => 'Longitud debe ser número',
            'longitud.between'   => 'Longitud entre -180 y 180',

            // Rol
            'rol.in'             => 'Rol inválido',

            // Biografía
            'biografia.max'      => 'Biografía muy larga (máx 1000)',

            // Redes Sociales
            'twitter.max'        => 'Twitter muy largo (máx 255)',
            'instagram.max'      => 'Instagram muy largo (máx 255)',
            'youtube.max'        => 'YouTube muy largo (máx 255)',
            'spotify.max'        => 'Spotify muy largo (máx 255)',
            'tiktok.max'         => 'TikTok muy largo (máx 255)',
            'soundcloud.max'     => 'SoundCloud muy largo (máx 255)',

            // Imágenes
            'avatar.image'       => 'Avatar debe ser imagen',
            'avatar.mimes'       => 'Formato: JPEG, PNG o WebP',
            'avatar.max'         => 'Avatar muy grande (máx 2MB)',
            'banner.image'       => 'Banner debe ser imagen',
            'banner.mimes'       => 'Formato: JPEG, PNG o WebP',
            'banner.max'         => 'Banner muy grande (máx 2MB)',
        ];
    }
}
