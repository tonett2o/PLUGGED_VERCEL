<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * SoftwareRequest - Validación de datos para operaciones con software
 *
 * Valida dos tipos de solicitudes diferentes:
 *
 * 1. SINCRONIZACIÓN DE SOFTWARE (usuario actualiza su equipamiento de software):
 *    - Recibe array software_ids (IDs de aplicaciones a asociar)
 *    - Usado por DetallesSoftware para sincronizar software del usuario
 *
 * 2. CREACIÓN DE SOFTWARE (administrador crea producto en catálogo):
 *    - Nombre único de la aplicación
 *    - Versión actual
 *    - Distribuidor/fabricante
 *    - Precio y tipo de pago (compra única, suscripción, gratuito)
 *    - URL a imagen
 *    - Descripción de características
 *
 * El request detecta automáticamente qué modo usar basándose en los campos presentes.
 *
 * Tipos de pago soportados:
 * - unico: compra única perpetua
 * - mensual: suscripción mensual
 * - anual: suscripción anual
 * - gratuito: software sin costo
 *
 * @package App\Http\Requests
 */
class SoftwareRequest extends FormRequest
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
     * Define las reglas de validación para software.
     *
     * Modo 1: Sincronización de equipamiento (si contiene software_ids)
     * - software_ids: array de IDs de software válidos
     *
     * Modo 2: Creación de nuevo software en catálogo
     * - nombre: requerido, único, máx 100 caracteres
     * - version: requerida, máx 50 caracteres
     * - distribuidor: requerido, máx 100 caracteres
     * - tipo_pago: requerido, debe ser uno de: unico, mensual, anual, gratuito
     * - precio: opcional, número decimal no negativo
     * - imagen: opcional, URL válida
     * - descripcion: opcional, texto libre
     *
     * @return array Reglas de validación
     */
    public function rules(): array
    {
        // Modo sincronización: detecta si es una actualización de software del usuario
        if ($this->has('software_ids')) {
            return [
                'software_ids'   => 'present|array',
                'software_ids.*' => 'integer|exists:software,id',
            ];
        }

        // Modo creación: reglas para crear nuevo software en catálogo
        return [
            'nombre'       => 'required|string|max:100|unique:software,nombre',
            'version'      => 'required|string|max:50',
            'distribuidor' => 'required|string|max:100',
            'precio'       => 'nullable|numeric|min:0',
            'tipo_pago'    => 'required|string|in:unico,mensual,anual,gratuito',
            'imagen'       => 'nullable|url',
            'descripcion'  => 'nullable|string',
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
            'nombre.required'   => 'El nombre del software es obligatorio.',
            'nombre.unique'     => 'Ese software ya existe en el catálogo global.',
            'version.required'  => 'La versión del software es obligatoria.',
            'precio.numeric'    => 'El precio debe ser un número decimal o entero.',
            'tipo_pago.in'      => 'El tipo de pago debe coincidir con la migración: unico, mensual, anual o gratuito.',
            'software_ids.*.exists' => 'Uno de los programas seleccionados no existe en el sistema.',
        ];
    }
}
