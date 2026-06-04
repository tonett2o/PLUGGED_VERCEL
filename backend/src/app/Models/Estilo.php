<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Estilo - Modelo de géneros/estilos musicales electrónicos
 *
 * Representa un género o estilo musical que puede asociarse con eventos.
 * Define una lista maestra de todos los géneros disponibles en la plataforma.
 *
 * Géneros soportados (46 total):
 * - Main genres (8): House, Techno, Trance, Drum and Bass, Dubstep, Ambient, Downtempo, Experimental
 * - Secondary genres (38): Deep House, Tech House, Hard Techno, Industrial, Progressive Trance,
 *   Psytrance, Goa Trance, Future Bass, Garage, Liquid Funk, Jungle, Neurofunk, Wave, Synthwave,
 *   y muchos más...
 *
 * Cada estilo tiene:
 * - Nombre único del género
 * - Color hexadecimal para visualización en mapas y cards
 *
 * Relaciones:
 * - Múltiples eventos pueden tener el mismo estilo
 * - Cada evento puede tener múltiples estilos
 *
 * @package App\Models
 *
 * @property int $id
 * @property string $nombre Nombre único del género/estilo musical
 * @property string $color Color hexadecimal (ej: #0ADAF5) para visualización
 * @property \Carbon\Carbon $created_at Timestamp de creación
 * @property \Carbon\Carbon $updated_at Timestamp de última actualización
 */
class Estilo extends Model
{
    public $timestamps = true;

    protected $fillable = ['nombre', 'color'];

    /**
     * Obtiene todos los eventos que tienen este estilo.
     *
     * Relación muchos-a-muchos: un estilo puede asociarse con múltiples eventos.
     * Cada evento puede tener múltiples estilos.
     * La tabla pivote eventos_estilos conecta estas dos entidades.
     *
     * @return BelongsToMany
     */
    public function eventos(): BelongsToMany
    {
        return $this->belongsToMany(Evento::class, 'eventos_estilos', 'id_estilo', 'id_evento');
    }

    /**
     * Obtiene todos los usuarios (productores/DJs) que producen este estilo.
     *
     * Relación muchos-a-muchos: un estilo puede asociarse con múltiples usuarios.
     * Cada usuario puede tener múltiples estilos primarios.
     * La tabla pivote usuarios_estilos conecta estas dos entidades.
     *
     * @return BelongsToMany
     */
    public function usuarios(): BelongsToMany
    {
        return $this->belongsToMany(Usuario::class, 'usuarios_estilos', 'id_estilo', 'id_usuario');
    }

    /**
     * Obtiene todas las canciones que tienen este estilo.
     *
     * Relación muchos-a-muchos: un estilo puede asociarse con múltiples canciones.
     * Cada canción puede tener múltiples estilos.
     * La tabla pivote canciones_estilos conecta estas dos entidades.
     *
     * @return BelongsToMany
     */
    public function canciones(): BelongsToMany
    {
        return $this->belongsToMany(Cancion::class, 'canciones_estilos', 'id_estilo', 'id_cancion');
    }
}
