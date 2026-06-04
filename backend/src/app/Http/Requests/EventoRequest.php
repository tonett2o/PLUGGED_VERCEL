<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;

/**
 * EventoRequest - Validación de datos para operaciones con eventos
 *
 * Valida y procesa datos de creación y actualización de eventos incluyendo:
 * - Datos básicos: nombre, sala, ubicación, fecha, URL de venta
 * - Datos geoespaciales: latitud, longitud
 * - Relaciones: estilos (géneros), colaboradores
 * - Archivos: imagen de cartel
 * - Conversión de JSON strings a arrays para relaciones
 * - Reglas diferentes para creación vs edición (imagen obligatoria vs opcional)
 *
 * @package App\Http\Requests
 */
class EventoRequest extends FormRequest
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
     * Convierte JSON strings a arrays para relaciones many-to-many,
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

        // Convertir JSON string de estilos a array si es necesario
        if ($this->has('estilos') && is_string($this->estilos)) {
            $this->merge([
                'estilos' => json_decode($this->estilos, true) ?? []
            ]);
        }
    }

    /**
     * Validaciones adicionales después de pasar las reglas básicas
     *
     * Verifica que el usuario actual no esté incluido en la lista de colaboradores.
     * Un usuario no puede ser creador y colaborador del mismo recurso.
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
     * Define las reglas de validación para el evento
     *
     * Valida:
     * - nombre: requerido, string, máx 255 caracteres
     * - nombre_sala: opcional, string, máx 255 caracteres
     * - ubicacion: opcional, string, máx 500 caracteres (dirección)
     * - latitud: opcional, número entre -90 y 90
     * - longitud: opcional, número entre -180 y 180
     * - url_venta: opcional, URL válida
     * - fecha_evento: opcional, formato YYYY-MM-DD
     * - estilos: opcional, array de IDs que existen en tabla estilos
     * - colaboradores: opcional, array de IDs que existen en tabla usuarios
     * - imagen: requerida en POST, opcional en PUT (edición)
     *
     * @return array Reglas de validación
     */
    public function rules(): array
    {
        // Reglas comunes para todos los casos
        $rules = [
            'nombre'       => 'required|string|max:255',
            'nombre_sala'  => 'required|string|max:255',
            'ubicacion'    => 'required|string|max:500',
            'latitud'      => 'required|numeric|between:-90,90',
            'longitud'     => 'required|numeric|between:-180,180',
            'url_venta'    => $this->getUrlVentaRule(),
            'fecha_evento' => 'required|date_format:Y-m-d',
            'estilos'      => 'nullable|array',
            'estilos.*'    => 'integer|exists:estilos,id',
            'colaboradores' => 'nullable|array',
            'colaboradores.*' => 'integer|exists:usuarios,id',
        ];

        // Imagen: obligatoria en creación (POST), opcional en edición (PUT)
        if ($this->isMethod('post')) {
            // Creación: imagen es obligatoria
            $rules['imagen'] = 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048';
        } else {
            // Edición (PUT): imagen es opcional (si no se sube, se mantiene la anterior)
            $rules['imagen'] = 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048';
        }

        return $rules;
    }

    /**
     * Genera la regla de validación para url_venta
     * - Si está vacía: nullable
     * - Si tiene valor: url válida + unique (excepto en edición si no cambia)
     *
     * @return string Regla de validación
     */
    private function getUrlVentaRule(): string
    {
        $url = $this->input('url_venta');

        // Si está vacía, es nullable
        if (empty($url)) {
            return 'nullable|url';
        }

        // Si tiene valor, debe ser URL válida
        $rule = 'url|unique:eventos,url_venta';

        // En edición (PUT), excluir el evento actual de la validación unique
        if ($this->isMethod('put')) {
            // El ID del evento viene en la URL: /api/eventos/{id}
            $eventoId = $this->route('evento');
            if ($eventoId) {
                $rule .= ',' . $eventoId;
            }
        }

        return $rule;
    }

    /**
     * Mensajes de error personalizados para validación
     *
     * Proporciona mensajes en español para cada regla de validación
     * para mejor experiencia del usuario.
     *
     * @return array Mensajes de error personalizados
     */
    public function messages(): array
    {
        return [
            // Nombre del evento
            'nombre.required'     => 'Nombre requerido',
            'nombre.string'       => 'Nombre debe ser texto',
            'nombre.max'          => 'Nombre muy largo (máx 255)',

            // Nombre de la sala
            'nombre_sala.required' => 'Sala requerida',
            'nombre_sala.string'  => 'Sala debe ser texto',
            'nombre_sala.max'     => 'Sala muy larga (máx 255)',

            // Ubicación
            'ubicacion.required'  => 'Ubicación requerida',
            'ubicacion.string'    => 'Ubicación debe ser texto',
            'ubicacion.max'       => 'Ubicación muy larga (máx 500)',

            // Coordenadas geográficas
            'latitud.required'    => 'Latitud requerida',
            'latitud.numeric'     => 'Latitud inválida',
            'latitud.between'     => 'Latitud entre -90 y 90',
            'longitud.required'   => 'Longitud requerida',
            'longitud.numeric'    => 'Longitud inválida',
            'longitud.between'    => 'Longitud entre -180 y 180',

            // URL de venta
            'url_venta.url'       => 'URL no válida',
            'url_venta.unique'    => 'Esta URL ya está registrada en otro evento',

            // Fecha del evento
            'fecha_evento.required' => 'Fecha requerida',
            'fecha_evento.date_format' => 'Formato: YYYY-MM-DD',

            // Estilos/Géneros
            'estilos.array'       => 'Estilos debe ser un array',
            'estilos.*.integer'   => 'Estilo ID inválido',
            'estilos.*.exists'    => 'Estilo no existe',

            // Colaboradores
            'colaboradores.array' => 'Colaboradores debe ser un array',
            'colaboradores.*.integer' => 'Colaborador ID inválido',
            'colaboradores.*.exists'  => 'Colaborador no existe',

            // Imagen del cartel
            'imagen.required'     => 'Imagen requerida',
            'imagen.image'        => 'Debe ser una imagen',
            'imagen.mimes'        => 'Formato: JPEG, PNG, JPG, GIF o WebP',
            'imagen.max'          => 'Imagen muy grande (máx 2MB)',
        ];
    }
}