<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * Coleccion - Modelo de colecciones (álbumes, EPs, recopilaciones)
 *
 * Representa una colección de canciones como un álbum, EP o recopilación con:
 * - Información: título, artista, descripción, portada
 * - Tipo: álbum, EP, single, recopilación, etc.
 * - Privacidad: pública o privada
 * - Propietario: usuario creador
 * - Canciones: múltiples tracks agrupados
 * - Colaboradores: múltiples usuarios que contribuyen
 * - Protección: colecciones del sistema (Singles, Me gusta) están protegidas
 *
 * @package App\Models
 *
 * @property int $id
 * @property string $titulo Nombre de la colección (álbum/EP)
 * @property string $artista Nombre del artista/banda
 * @property string|null $portada Ruta a la imagen de portada
 * @property string|null $descripcion Descripción detallada de la colección
 * @property string $tipo Tipo de colección (album, ep, single, recopilacion, etc.)
 * @property string|null $privacidad Nivel de privacidad (publica, privada)
 * @property \Carbon\Carbon|null $fecha_publicacion Fecha de lanzamiento
 * @property int $id_usuario ID del usuario propietario
 * @property bool $protegida Indica si la colección está protegida del sistema (no se puede eliminar)
 * @property \Carbon\Carbon $created_at Timestamp de creación
 * @property \Carbon\Carbon $updated_at Timestamp de última actualización
 */
class Coleccion extends Model
{
    use HasFactory;
    protected $table = "colecciones";
    
    protected $fillable = [
        'titulo',
        'artista',
        'portada',
        'descripcion',
        'tipo',
        'privacidad',
        'fecha_publicacion',
        'id_usuario',
        'protegida'
    ];

    protected function portada(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? (str_starts_with($value, 'http') ? $value : asset('storage/' . $value)) : null,
        );
    }

    /**
     * Obtiene todas las canciones que pertenecen a esta colección.
     *
     * Relación uno-a-muchos: una colección puede contener múltiples canciones.
     * Las canciones están agrupadas dentro de esta colección (álbum/EP).
     *
     * @return HasMany Colección de canciones
     */
    public function canciones(): HasMany
    {
        return $this->hasMany(Cancion::class, 'id_coleccion');
    }

    /**
     * Obtiene el usuario propietario/creador de la colección.
     *
     * Relación uno-a-muchos inversa: cada colección pertenece a un usuario.
     * El usuario es el creador y propietario de la colección.
     *
     * @return BelongsTo
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    /**
     * Obtiene todos los colaboradores de la colección.
     *
     * Relación muchos-a-muchos: una colección puede tener múltiples colaboradores.
     * Cada colaborador es un usuario que contribuye al proyecto de la colección.
     *
     * @return BelongsToMany
     */
    public function colaboradores(): BelongsToMany
    {
        return $this->belongsToMany(
            Usuario::class,
            'coleccion_colaboradores',
            'id_coleccion',
            'id_usuario'
        )->withTimestamps();
    }
}