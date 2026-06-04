<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Evento - Modelo de eventos musicales
 *
 * Representa un evento (concierto, festival, jam session, etc.) con:
 * - Información básica: nombre, sala, ubicación, fecha
 * - Datos geoespaciales: latitud, longitud
 * - Cartel/imagen del evento
 * - URL de venta de entradas
 * - Múltiples géneros/estilos musicales (many-to-many)
 * - Múltiples colaboradores/usuarios (many-to-many)
 * - Propietario/creador del evento
 *
 * @package App\Models
 *
 * @property int $id
 * @property string $nombre Nombre del evento
 * @property string|null $nombre_sala Nombre de la sala/lugar del evento
 * @property string|null $ubicacion Dirección o descripción de ubicación
 * @property decimal|null $latitud Latitud geográfica (8 decimales de precisión)
 * @property decimal|null $longitud Longitud geográfica (8 decimales de precisión)
 * @property string|null $imagen Ruta a la imagen de cartel del evento
 * @property \Carbon\Carbon $fecha_evento Fecha del evento (formato YYYY-MM-DD)
 * @property string|null $url_venta URL para compra de entradas
 * @property int|null $id_usuario ID del usuario propietario del evento
 * @property \Carbon\Carbon $created_at Timestamp de creación
 * @property \Carbon\Carbon $updated_at Timestamp de actualización
 */
class Evento extends Model
{
    use HasFactory;

    protected $table = "eventos";

    /**
     * Atributos que pueden ser asignados masivamente
     *
     * @var array
     */
    protected $fillable = [
        'url_venta',
        'nombre',
        'nombre_sala',
        'ubicacion',
        'latitud',
        'longitud',
        'imagen',
        'fecha_evento',
        'id_usuario'
    ];

    /**
     * Conversión de tipos de atributos
     *
     * @var array
     */
    protected $casts = [
        'latitud' => 'decimal:8',      // Precisión de 8 decimales para coordenadas
        'longitud' => 'decimal:8',     // Precisión de 8 decimales para coordenadas
        'fecha_evento' => 'date',      // Convertir a instancia Carbon (YYYY-MM-DD)
    ];

    /**
     * Obtiene los usuarios propietarios/creadores del evento
     *
     * Relación many-to-many: un evento puede tener múltiples usuarios propietarios.
     *
     * @return BelongsToMany
     */
    public function usuarios(): BelongsToMany
    {
        return $this->belongsToMany(
            Usuario::class,
            'usuarios_eventos',     // Tabla pivot
            'id_usuario',           // FK en pivot hacia usuarios
            'id_evento'             // FK en pivot hacia eventos
        );
    }

    /**
     * Obtiene los estilos/géneros musicales del evento
     *
     * Relación many-to-many: un evento puede tener múltiples géneros/estilos.
     *
     * @return BelongsToMany
     */
    public function estilos(): BelongsToMany
    {
        return $this->belongsToMany(
            Estilo::class,
            'eventos_estilos',      // Tabla pivot
            'id_evento',            // FK en pivot hacia eventos
            'id_estilo'             // FK en pivot hacia estilos
        );
    }

    /**
     * Obtiene los colaboradores del evento
     *
     * Relación many-to-many: un evento puede tener múltiples colaboradores (usuarios).
     *
     * @return BelongsToMany
     */
    public function colaboradores(): BelongsToMany
    {
        return $this->belongsToMany(
            Usuario::class,
            'evento_colaboradores',  // Tabla pivot
            'id_evento',             // FK en pivot hacia eventos
            'id_usuario'             // FK en pivot hacia usuarios
        )->withTimestamps();          // Incluir created_at y updated_at en pivot
    }
}
