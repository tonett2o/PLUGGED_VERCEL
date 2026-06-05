<?php

namespace Database\Factories;

use App\Models\Playlist;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * PlaylistFactory - Factory para generar datos de prueba de playlists
 *
 * Genera instancias fake de playlists (listas de reproducción) con datos
 * realistas para pruebas, seeders y testing. Cada playlist creada tendrá:
 * - Título aleatorio
 * - Nombre del compilador aleatorio
 * - Portada/imagen fake
 * - Descripción breve
 * - Privacidad: pública o privada
 * - Año de creación aleatorio
 * - Usuario propietario (creado si no existe)
 *
 * Las relaciones se crean automáticamente usando factory() si no se proporcionan.
 *
 * Uso en tests:
 * - Playlist::factory()->create() - Crea playlist con usuario nuevo
 * - Playlist::factory()->create(['privacidad' => 'privada']) - Sobrescribe campos
 * - Playlist::factory()->count(3)->create() - Crea 3 playlists
 *
 * @extends Factory<Playlist>
 */
class PlaylistFactory extends Factory
{
    /**
     * El nombre del modelo que corresponde a esta factory.
     */
    protected $model = Playlist::class;

    /**
     * Define el estado predeterminado del modelo Playlist.
     *
     * Genera atributos aleatorios usando Faker para poblar un registro
     * de playlist con datos realistas pero ficticios.
     *
     * Atributos generados:
     * - titulo: 3 palabras aleatorias como nombre de playlist
     * - artista: nombre de persona como compilador
     * - portada: URL de imagen fake en categoría "playlist"
     * - descripcion: frase aleatoria
     * - privacidad: uno de [publica, privada]
     * - fecha_publicacion: año aleatorio
     * - id_usuario: Usuario creado automáticamente
     * - canciones: 0 inicialmente (las canciones se añaden después)
     * - protegida: false por defecto
     *
     * @return array<string, mixed> Atributos de la playlist
     */
    public function definition(): array
    {
        return [
            'titulo' => $this->faker->words(3, true),
            'artista' => $this->faker->name(),
            'portada' => $this->faker->imageUrl(500, 500, 'playlist'),
            'descripcion' => $this->faker->sentence(),
            'privacidad' => $this->faker->randomElement(['publica', 'privada']),
            'fecha_publicacion' => $this->faker->year(),
            'id_usuario' => Usuario::factory(),
        ];
    }
}
