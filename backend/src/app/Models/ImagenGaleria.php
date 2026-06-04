<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ImagenGaleria - Modelo de imágenes de la galería del usuario
 *
 * Almacena imágenes individuales en la galería personal de un usuario.
 * Incluye capturas de pantalla de producciones, fotos de setup, arte visual, etc.
 *
 * Características:
 * - Cada imagen pertenece a un usuario (galería personal)
 * - Ruta al archivo de imagen almacenado
 * - Timestamp de carga (para ordenar por recientes primero)
 * - Las imágenes se pueden mostrar en el perfil del usuario
 *
 * Uso:
 * - Galería visual en el perfil de usuario
 * - Compartir fotos de setup/estudio
 * - Portfolio visual de proyectos
 * - Screenshots de trabajos en progreso
 *
 * @package App\Models
 *
 * @property int $id
 * @property int $id_usuario ID del usuario propietario de la galería
 * @property string $imagen Ruta al archivo de imagen almacenado
 * @property \Carbon\Carbon $created_at Timestamp de carga de la imagen
 * @property \Carbon\Carbon $updated_at Timestamp de última actualización
 */
class ImagenGaleria extends Model
{
    use HasFactory;

    protected $table = 'galeria_usuario';
    protected $fillable = ['id_usuario', 'imagen'];

    /**
     * Obtiene el usuario propietario de esta imagen de galería.
     *
     * Relación uno-a-muchos inversa: cada imagen pertenece a un usuario.
     * Un usuario puede tener múltiples imágenes en su galería.
     *
     * @return BelongsTo
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }
}
