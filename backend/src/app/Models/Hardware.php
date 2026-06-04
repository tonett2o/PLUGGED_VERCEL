<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * Hardware - Modelo de equipamiento físico de música
 *
 * Representa un dispositivo o equipo de hardware utilizado en producción musical:
 * - Sintetizadores y controladores
 * - Monitores de estudio y altavoces
 * - Interfaces de audio
 * - Controladores MIDI
 * - Microfonos y accesorios
 * - Equipos de grabación y mezcla
 *
 * Información:
 * - Nombre del dispositivo
 * - Marca/fabricante
 * - Precio
 * - Imagen/foto del hardware
 * - Descripción detallada
 *
 * Relaciones:
 * - Múltiples usuarios pueden poseer el mismo hardware
 * - Cada usuario puede tener múltiples dispositivos de hardware
 * - La cantidad de cada hardware se almacena en el pivot
 *
 * @package App\Models
 *
 * @property int $id
 * @property string $nombre Nombre del dispositivo
 * @property string|null $marca Marca/fabricante
 * @property decimal|null $precio Costo del hardware
 * @property string|null $imagen Ruta a la imagen del dispositivo
 * @property string|null $descripcion Descripción detallada de características
 * @property \Carbon\Carbon $created_at Timestamp de creación
 * @property \Carbon\Carbon $updated_at Timestamp de última actualización
 */
class Hardware extends Model
{
    use HasFactory;

    protected $table = "hardware";
    protected $fillable = ['nombre', 'marca', 'precio', 'imagen', 'descripcion'];

    protected function imagen(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? asset('storage/' . $value) : null,
        );
    }

    /**
     * Obtiene todos los usuarios que poseen este hardware.
     *
     * Relación muchos-a-muchos: un hardware puede ser poseído por múltiples usuarios.
     * Cada usuario puede poseer múltiples dispositivos de hardware.
     * La cantidad de unidades de cada hardware se almacena en el pivot.
     *
     * @return BelongsToMany
     */
    public function usuarios(): BelongsToMany
    {
        return $this->belongsToMany(
            Usuario::class,
            'usuarios_hardware',
            'id_hardware',
            'id_usuario'
        );
    }
}
