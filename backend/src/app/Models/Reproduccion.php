<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Reproduccion - Modelo de registro de escuchas/reproducciones
 *
 * Registra cada vez que una canción es reproducida en la plataforma.
 * Mantiene un histórico de escuchas para análisis de popularidad y estadísticas.
 *
 * Información:
 * - Canción reproducida (referencia a Cancion)
 * - Usuario que reproduce (puede ser anónimo/null)
 * - Timestamp de la reproducción (creado automáticamente)
 *
 * Uso:
 * - Contar total de reproducciones por canción
 * - Analizar tendencias de escucha
 * - Calcular oyentes únicos
 * - Determinar canciones más populares
 * - Ranking de artistas (por reproducciones de sus canciones)
 *
 * @package App\Models
 *
 * @property int $id
 * @property int $id_cancion ID de la canción reproducida
 * @property int|null $id_usuario ID del usuario que reprodujo (null si es anónimo)
 * @property \Carbon\Carbon $created_at Timestamp de la reproducción
 * @property \Carbon\Carbon $updated_at Timestamp de última actualización
 */
class Reproduccion extends Model
{
    protected $table = 'reproducciones';

    protected $fillable = [
        'id_cancion',
        'id_usuario',
    ];

    /**
     * Obtiene la canción que fue reproducida.
     *
     * Relación uno-a-muchos inversa: cada reproducción está vinculada a una canción.
     * Múltiples reproducciones pueden referir a la misma canción.
     *
     * @return BelongsTo
     */
    public function cancion(): BelongsTo
    {
        return $this->belongsTo(Cancion::class, 'id_cancion');
    }

    /**
     * Obtiene el usuario que realizó la reproducción.
     *
     * Relación uno-a-muchos inversa: cada reproducción puede pertenecer a un usuario.
     * Si id_usuario es null, la reproducción es anónima (usuario no autenticado).
     * Múltiples reproducciones pueden venir del mismo usuario.
     *
     * @return BelongsTo
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }
}
