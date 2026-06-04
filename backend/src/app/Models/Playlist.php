<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Playlist - Modelo de playlists (listas de reproducción)
 *
 * Representa una lista de reproducción personalizada con:
 * - Información: título, artista (compilador), descripción, portada
 * - Privacidad: pública o privada
 * - Propietario: usuario creador
 * - Canciones: múltiples tracks con orden personalizado
 * - Protección: algunas playlists del sistema están protegidas
 *
 * Las playlists almacenan un contador de canciones pero la fuente de verdad
 * es la tabla pivote cancion_playlist que incluye el orden de cada canción.
 *
 * @package App\Models
 *
 * @property int $id
 * @property string $titulo Nombre de la playlist
 * @property string|null $artista Nombre del compilador/organizador
 * @property string|null $portada Ruta a la imagen de portada
 * @property string|null $descripcion Descripción detallada de la playlist
 * @property int $canciones Contador de canciones (informativo, ver relación para verdad)
 * @property string|null $privacidad Nivel de privacidad (publica, privada)
 * @property \Carbon\Carbon|null $fecha_publicacion Fecha de creación
 * @property int $id_usuario ID del usuario propietario
 * @property bool $protegida Indica si la playlist está protegida (no se puede eliminar)
 * @property \Carbon\Carbon $created_at Timestamp de creación
 * @property \Carbon\Carbon $updated_at Timestamp de última actualización
 */
class Playlist extends Model
{
    use HasFactory;
    protected $table = "playlists";

    protected $fillable = [
        'titulo',
        'artista',
        'portada',
        'descripcion',
        'privacidad',
        'fecha_publicacion',
        'id_usuario',
        'protegida'
    ];

    /**
     * Obtiene todas las canciones de la playlist con orden personalizado.
     *
     * Relación muchos-a-muchos: una playlist contiene múltiples canciones.
     * Cada canción puede estar en múltiples playlists.
     * El pivot 'orden' determina la posición de cada canción dentro de esta playlist.
     *
     * @return BelongsToMany Canciones ordenadas por su posición en la playlist
     */
    public function canciones(): BelongsToMany
    {
        return $this->belongsToMany(
            Cancion::class,
            'cancion_playlist',
            'id_playlist',
            'id_cancion'
        )->withPivot('orden')->withTimestamps();
    }

    /**
     * Obtiene el usuario propietario/creador de la playlist.
     *
     * Relación uno-a-muchos inversa: cada playlist pertenece a un usuario.
     * El usuario es el creador y propietario de la playlist.
     *
     * @return BelongsTo
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }
}
