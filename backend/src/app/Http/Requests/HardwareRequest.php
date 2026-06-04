<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * HardwareRequest - Validación de datos para operaciones con hardware
 *
 * Valida dos tipos de solicitudes diferentes:
 *
 * 1. SINCRONIZACIÓN DE EQUIPAMIENTO (usuario actualiza su equipamiento):
 *    - Recibe array hardware_ids (IDs de dispositivos a asociar)
 *    - Usado por DetallesHardware para sincronizar equipamiento del usuario
 *
 * 2. CREACIÓN DE HARDWARE (administrador crea producto en catálogo):
 *    - Nombre único del dispositivo
 *    - Marca/fabricante
 *    - Precio y descripción
 *    - URL a imagen
 *
 * El request detecta automáticamente qué modo usar basándose en los campos presentes.
 *
 * @package App\Http\Requests
 */
class HardwareRequest extends FormRequest
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
     * Define las reglas de validación para hardware.
     *
     * Modo 1: Sincronización de equipamiento (si contiene hardware_ids)
     * - hardware_ids: array de IDs de hardware válidos
     *
     * Modo 2: Creación de nuevo hardware en catálogo
     * - nombre: requerido, único, máx 100 caracteres
     * - marca: requerida, máx 100 caracteres
     * - precio: opcional, número decimal no negativo
     * - imagen: opcional, URL válida
     * - descripcion: opcional, texto libre
     *
     * @return array Reglas de validación
     */
    public function rules(): array
    {
        // Modo sincronización: detecta si es una actualización de equipamiento del usuario
        if ($this->has('hardware_ids')) {
            return [
                'hardware_ids'   => 'present|array',
                'hardware_ids.*' => 'integer|exists:hardware,id',
            ];
        }

        // Modo creación: reglas para crear nuevo hardware en catálogo
        return [
            'nombre'      => 'required|string|max:100|unique:hardware,nombre',
            'marca'       => 'required|string|max:100',
            'precio'      => 'nullable|numeric|min:0',
            'imagen'      => 'nullable|url',
            'descripcion' => 'nullable|string',
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
            'nombre.required' => 'El nombre del equipo es obligatorio.',
            'nombre.unique'   => 'Ese equipo ya existe en el catálogo global.',
            'marca.required'  => 'La marca del equipo es obligatoria.',
            'precio.numeric'  => 'El precio debe ser un valor numérico.',
            'hardware_ids.*.exists' => 'Uno de los hardware seleccionados no existe en el sistema.',
        ];
    }
}
