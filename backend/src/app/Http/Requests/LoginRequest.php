<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;

/**
 * LoginRequest - Validación de datos para inicio de sesión
 *
 * Valida credenciales de login:
 * - Email: obligatorio, formato válido
 * - Password: obligatorio
 *
 * @package App\Http\Requests
 */
class LoginRequest extends FormRequest
{
    /**
     * Autoriza la solicitud para todos los usuarios.
     *
     * @return bool True (permite todos)
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
     * Define las reglas de validación
     *
     * @return array Reglas de validación
     */
    public function rules(): array
    {
        return [
            'email'    => 'required|email:rfc',
            'password' => 'required|string|min:1',
        ];
    }

    /**
     * Mensajes de error personalizados en español
     *
     * @return array Mensajes personalizados
     */
    public function messages(): array
    {
        return [
            'email.required'   => 'El email es obligatorio.',
            'email.email'      => 'El email debe ser válido.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.string'  => 'La contraseña debe ser un texto.',
            'password.min'     => 'La contraseña debe tener al menos 1 carácter.',
        ];
    }
}
