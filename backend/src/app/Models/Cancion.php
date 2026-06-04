<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Cancion - Modelo de canciones/tracks de la plataforma
 *
 * Representa una canción o track musical con:
 * - Metadatos musicales: título, BPM, tonalidad, estilo, privacidad
 * - Archivos: ubicación del archivo de audio, portada (imagen)
 * - Propietario: usuario creador de la canción
 * - Colecciones: puede pertenecer a un álbum/EP (colección)
 * - Playlists: puede estar en múltiples playlists
 * - Interacciones: likes, comentarios, reproducciones
 * - Colaboradores: múltiples usuarios que contribuyen
 *
 * @package App\Models
 *
 * @property int $id
 * @property string $titulo Nombre de la canción
 * @property int|null $bpm Tempo en beats por minuto
 * @property string|null $tonalidad Tonalidad musical (C, D, Em, etc.)
 * @property string|null $estilo Género o estilo musical
 * @property string|null $ubicacion Ruta al archivo de audio (se convierte a URL completa vía Attribute)
 * @property string|null $portada Ruta a la imagen de portada (se convierte a URL completa vía Attribute)
 * @property string|null $privacidad Nivel de privacidad (publica, privada)
 * @property \Carbon\Carbon|null $fecha_publicacion Fecha de publicación
 * @property int|null $id_usuario ID del usuario propietario
 * @property int|null $id_coleccion ID de la colección (álbum/EP) a la que pertenece
 * @property \Carbon\Carbon $created_at Timestamp de creación
 * @property \Carbon\Carbon $updated_at Timestamp de última actualización
 */
class Cancion extends Model
{
    use HasFactory;
    protected $table = "canciones";

    protected $fillable = [
        'titulo',
        'bpm',
        'tonalidad',
        'estilo',
        'ubicacion',
        'portada',
        'privacidad',
        'fecha_publicacion',
        'id_usuario',
        'id_coleccion'
    ];

    /**
     * Acceso para obtener la URL completa de la ubicación del archivo de audio.
     *
     * Convierte la ruta almacenada en storage a una URL pública y accesible.
     * Si no hay archivo, retorna null.
     *
     * @return \Illuminate\Database\Eloquent\Casts\Attribute Atributo con getter
     */
    protected function ubicacion(): Attribute
    {
        return Attribute::make(
            get: fn($value) => $value ? asset('storage/' . $value) : null,
        );
    }

    /**
     * Acceso para obtener la URL completa de la portada de la canción.
     *
     * Convierte la ruta almacenada en storage a una URL pública.
     * Si no hay portada, retorna una imagen por defecto.
     *
     * @return \Illuminate\Database\Eloquent\Casts\Attribute Atributo con getter
     */
    protected function portada(): Attribute
    {
        return Attribute::make(
            get: fn($value) => $value ? asset('storage/' . $value) : asset('assets/portada-default.jpg'),
        );
    }

    /**
     * Obtiene el usuario propietario de la canción.
     *
     * Relación uno-a-muchos inversa: cada canción pertenece a exactamente un usuario.
     *
     * @return BelongsTo
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    /**
     * Obtiene la colección (álbum/EP) a la que pertenece esta canción.
     *
     * Relación uno-a-muchos inversa: una canción puede pertenecer a una colección o estar suelta.
     * Es opcional (puede ser null si la canción no está en una colección).
     *
     * @return BelongsTo
     */
    public function coleccion(): BelongsTo
    {
        return $this->belongsTo(Coleccion::class, 'id_coleccion');
    }

    /**
     * Obtiene todas las playlists que contienen esta canción.
     *
     * Relación muchos-a-muchos: una canción puede estar en múltiples playlists.
     * El pivot incluye el orden (posición) de la canción dentro de cada playlist.
     *
     * @return BelongsToMany
     */
    public function playlists(): BelongsToMany
    {
        return $this->belongsToMany(
            Playlist::class,
            'cancion_playlist',
            'id_cancion',
            'id_playlist'
        )->withPivot('orden')->withTimestamps();
    }

    /**
     * Obtiene todos los usuarios que han dado like a esta canción.
     *
     * Relación muchos-a-muchos: una canción puede recibir likes de múltiples usuarios,
     * y cada usuario puede dar like a múltiples canciones.
     *
     * @return BelongsToMany
     */
    public function likes(): BelongsToMany
    {
        return $this->belongsToMany(Usuario::class, 'likes', 'id_cancion', 'id_usuario')->withTimestamps();
    }

    /**
     * Obtiene todos los comentarios realizados en esta canción.
     *
     * Relación muchos-a-muchos: una canción puede tener múltiples comentarios de diferentes usuarios.
     * El pivot incluye el texto del comentario y el segundo (timestamp) en que fue realizado.
     *
     * @return BelongsToMany
     */
    public function comentarios(): BelongsToMany
    {
        return $this->belongsToMany(Usuario::class, 'comentarios', 'id_cancion', 'id_usuario')
            ->withPivot('texto', 'segundo')
            ->withTimestamps();
    }

    /**
     * Obtiene todas las reproducciones/escuchas de esta canción.
     *
     * Relación uno-a-muchos: una canción puede tener múltiples registros de reproducción.
     * Cada reproducción registra un usuario (o anónimo) escuchando la canción.
     *
     * @return HasMany
     */
    public function reproducciones(): HasMany
    {
        return $this->hasMany(Reproduccion::class, 'id_cancion');
    }

    /**
     * Obtiene todos los colaboradores que contribuyen a esta canción.
     *
     * Relación muchos-a-muchos: una canción puede tener múltiples colaboradores (usuarios que aportan).
     * Cada colaborador puede trabajar en múltiples canciones.
     *
     * @return BelongsToMany
     */
    public function colaboradores(): BelongsToMany
    {
        return $this->belongsToMany(
            Usuario::class,
            'cancion_colaboradores',
            'id_cancion',
            'id_usuario'
        )->withTimestamps();
    }

    /**
     * Obtiene todos los géneros/estilos asociados a esta canción.
     *
     * Relación muchos-a-muchos: una canción puede tener múltiples estilos.
     * Cada estilo puede asociarse con múltiples canciones.
     * La tabla pivote canciones_estilos conecta estas dos entidades.
     *
     * @return BelongsToMany
     */
    public function estilos(): BelongsToMany
    {
        return $this->belongsToMany(
            Estilo::class,
            'canciones_estilos',
            'id_cancion',
            'id_estilo'
        )->withTimestamps();
    }
}