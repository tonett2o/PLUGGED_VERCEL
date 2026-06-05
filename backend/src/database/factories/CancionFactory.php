<?php

namespace Database\Factories;

use App\Models\Cancion;
use App\Models\Usuario;
use App\Models\Coleccion;
use Illuminate\Database\Eloquent\Factories\Factory;
use Faker\Generator;

/**
 * CancionFactory - Factory para generar datos de prueba de canciones
 *
 * Genera instancias fake de canciones con datos realistas para pruebas,
 * seeders y testing. Cada canción creada tendrá:
 * - Título aleatorio
 * - BPM típico para música electrónica (120-150)
 * - Tonalidad musical aleatoria
 * - URL fake al archivo de audio
 * - Portada/imagen fake
 * - Año de publicación aleatorio
 * - Usuario propietario (creado si no existe)
 * - Colección/álbum asociado (creado si no existe)
 *
 * Las relaciones se crean automáticamente usando factory() si no se proporcionan.
 *
 * Uso en tests:
 * - Cancion::factory()->create() - Crea canción con usuario y colección nuevos
 * - Cancion::factory()->create(['id_usuario' => 1]) - Asigna usuario existente
 * - Cancion::factory()->for(User::find(1), 'usuario')->create() - Con relación explícita
 *
 * @extends Factory<Cancion>
 */
class CancionFactory extends Factory
{
    /**
     * El nombre del modelo que corresponde a esta factory.
     */
    protected $model = Cancion::class;

    /**
     * Define el estado predeterminado del modelo Cancion.
     *
     * Genera atributos aleatorios usando Faker para poblar un registro
     * de canción con datos realistas pero ficticios.
     *
     * Atributos generados:
     * - titulo: 3 palabras aleatorias como título
     * - bpm: tempo entre 120 y 150 (típico electrónico)
     * - tonalidad: una de [Am, Cm, F#m, G] (tonalidades comunes)
     * - ubicacion: URL fake del archivo de audio
     * - portada: URL de imagen fake en categoría "techno"
     * - fecha_publicacion: año aleatorio
     * - id_usuario: Usuario creado automáticamente
     * - id_coleccion: Colección creada automáticamente
     *
     * @return array<string, mixed> Atributos de la canción
     */
    public function definition(): array
    {
        $faker = resolve(Generator::class);

        // Pool de audios reales disponibles en storage
        $audiosDisponibles = [
            'audios/1QECXGjby1ICwbeV2mxsdVi5kdM0EXl5iFCBLHO2.mp3',
            'audios/28oY3tWZoMLBNnIVCVxRayON9FggTRO3xIbLrLM0.mp3',
            'audios/2HhdHagZjcOPL5Gr1DxiE7SiUzbOkW2RUiArBQ85.mp3',
            'audios/35hUFrgKW67CaDwxpXnHOJlqTi6vuU5WHg61zmsa.mp3',
            'audios/3a0dtwy6ZOr5PqAlafXKyZi6kWrvyDVzEPsnNWiS.mp3',
        ];

        return [
            'titulo' => $faker->words(3, true),
            'bpm' => $faker->numberBetween(90, 140),
            'tonalidad' => $faker->randomElement(['Am', 'Cm', 'F#m', 'G', 'Dm', 'Em', 'Gm']),
            'ubicacion' => $faker->randomElement($audiosDisponibles), // Audio real en lugar de URL fake
            'portada' => $faker->imageUrl(500, 500, 'music'),
            'fecha_publicacion' => $faker->year(),
            'privacidad' => $faker->randomElement(['publica', 'privada']),
            'id_usuario' => Usuario::factory(),
            'id_coleccion' => Coleccion::factory(),
        ];
    }

    /**
     * Asigna géneros a la canción (se sincronizarán en seeder).
     *
     * Almacena IDs de géneros para ser sincronizados después de creación.
     * Los géneros se asocian en DatabaseSeeder usando sync().
     *
     * @param array $genreIds IDs de estilos a asignar
     * @return $this Factory state
     */
    public function withGenres($genreIds): static
    {
        return $this->state(function (array $attributes) use ($genreIds) {
            $attributes['_genre_ids'] = $genreIds;
            return $attributes;
        });
    }
}
