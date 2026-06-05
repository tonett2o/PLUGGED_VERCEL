<?php

namespace Database\Factories;

use App\Models\Coleccion;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * ColeccionFactory - Factory para generar datos de prueba de colecciones
 *
 * Genera instancias fake de colecciones (álbumes y EPs) con datos realistas
 * para pruebas, seeders y testing. Cada colección creada tendrá:
 * - Título aleatorio
 * - Nombre de artista/banda aleatorio
 * - Portada/imagen fake en estilo "abstract"
 * - Tipo: album o ep
 * - Año de publicación aleatorio
 * - Usuario propietario (creado si no existe)
 *
 * Las relaciones se crean automáticamente usando factory() si no se proporcionan.
 *
 * Uso en tests:
 * - Coleccion::factory()->create() - Crea colección con usuario nuevo
 * - Coleccion::factory()->create(['id_usuario' => 1]) - Asigna usuario existente
 * - Coleccion::factory()->createQuietly() - Sin eventos
 *
 * @extends Factory<Coleccion>
 */
class ColeccionFactory extends Factory
{
    /**
     * El nombre del modelo que corresponde a esta factory.
     */
    protected $model = Coleccion::class;

    /**
     * Define el estado predeterminado del modelo Coleccion.
     *
     * Genera atributos aleatorios usando Faker para poblar un registro
     * de colección con datos realistas pero ficticios.
     *
     * Atributos generados:
     * - titulo: frase de hasta 3 palabras como título del álbum
     * - artista: nombre de persona como nombre del artista
     * - portada: URL de imagen fake en categoría "abstract"
     * - tipo: uno de [album, ep]
     * - fecha_publicacion: año aleatorio
     * - id_usuario: Usuario creado automáticamente
     * - descripcion: null (opcional)
     * - privacidad: null (opcional)
     * - protegida: false por defecto
     *
     * @return array<string, mixed> Atributos de la colección
     */
    public function definition(): array
    {
        return [
            'titulo' => $this->faker->sentence(3),
            'artista' => $this->faker->name(),
            'portada' => $this->faker->imageUrl(500, 500, 'abstract'),
            'tipo' => $this->faker->randomElement(['album', 'ep']),
            'fecha_publicacion' => $this->faker->year(),
            'id_usuario' => Usuario::factory(),
        ];
    }
}
