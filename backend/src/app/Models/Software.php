<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * Software - Modelo de herramientas de software musical
 *
 * Representa una aplicación o herramienta de software utilizada en producción musical:
 * - DAWs: Logic, Ableton, FL Studio, Cubase, etc.
 * - Plugins: sintetizadores, efectos, procesadores
 * - Herramientas: editores de audio, masterización, síntesis, etc.
 *
 * Información:
 * - Nombre y versión del software
 * - Distribuidor/fabricante
 * - Precio y tipo de pago (compra, suscripción)
 * - Imagen/logo del software
 * - Descripción de características
 *
 * Relaciones:
 * - Múltiples usuarios pueden utilizar el mismo software
 * - Cada usuario puede usar múltiples software
 *
 * @package App\Models
 *
 * @property int $id
 * @property string $nombre Nombre del software
 * @property string|null $version Número de versión actual
 * @property string|null $distribuidor Nombre del fabricante/distribuidor
 * @property decimal|null $precio Costo del software
 * @property string|null $tipo_pago Modelo de pago (compra, suscripcion, gratuito)
 * @property string|null $imagen Ruta a la imagen/logo del software
 * @property string|null $descripcion Descripción detallada de características
 * @property \Carbon\Carbon $created_at Timestamp de creación
 * @property \Carbon\Carbon $updated_at Timestamp de última actualización
 */
class Software extends Model
{
    use HasFactory;

    protected $table = "software";
    protected $fillable = ['nombre', 'version', 'distribuidor', 'precio', 'tipo_pago', 'imagen', 'descripcion'];

    protected function imagen(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? asset('storage/' . $value) : null,
        );
    }

    /**
     * Obtiene todos los usuarios que utilizan este software.
     *
     * Relación muchos-a-muchos: un software puede ser usado por múltiples usuarios.
     * Cada usuario puede utilizar múltiples software.
     *
     * @return BelongsToMany
     */
    public function usuarios(): BelongsToMany
    {
        return $this->belongsToMany(
            Usuario::class,
            'usuarios_software',
            'id_software',
            'id_usuario'
        );
    }
}
