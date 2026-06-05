<?php

namespace Database\Factories;

use App\Models\Evento;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * EventoFactory - Factory para generar datos de prueba de eventos
 *
 * Genera instancias fake de eventos musicales (conciertos, festivales, etc.)
 * con datos realistas para pruebas, seeders y testing. Cada evento creado tendrá:
 * - URL única de venta de entradas
 * - Nombre/título del evento
 * - Nombre de la sala/venue
 * - Dirección/ubicación
 * - Imagen de cartel/póster
 * - Año/fecha del evento
 *
 * Los eventos generados pueden luego asociarse con:
 * - Usuarios (propietarios y colaboradores)
 * - Géneros/estilos musicales
 *
 * Uso en tests:
 * - Evento::factory()->create() - Crea evento
 * - Evento::factory()->count(5)->create() - Crea 5 eventos
 * - Evento::factory()->create(['nombre' => 'TechFest 2026']) - Sobrescribe campos
 *
 * @extends Factory<Evento>
 */
class EventoFactory extends Factory
    /**
     * El nombre del modelo que corresponde a esta factory.
     */
    protected $model = Evento::class;
{
    /**
     * Define el estado predeterminado del modelo Evento.
     *
     * Genera atributos aleatorios usando Faker para poblar un registro
     * de evento con datos realistas pero ficticios.
     *
     * Atributos generados:
     * - url_venta: URL única para compra de entradas
     * - nombre: nombre del evento (3 palabras)
     * - nombre_sala: nombre de empresa + " Stage" como venue
     * - ubicacion: dirección aleatoria
     * - imagen: URL de imagen fake en categoría "concert" (800x600)
     * - fecha_evento: año aleatorio
     * - latitud: null (opcional, se puede rellenar después)
     * - longitud: null (opcional, se puede rellenar después)
     * - id_usuario: null (opcional, se asigna manualmente si se requiere)
     *
     * @return array<string, mixed> Atributos del evento
     */
    public function definition(): array
    {
        return [
            'url_venta' => $this->faker->unique()->url(),
            'nombre' => $this->faker->sentence(2, 3),
            'nombre_sala' => $this->faker->company() . ' Stage',
            'ubicacion' => $this->faker->address(),
            'imagen' => $this->faker->imageUrl(800, 600, 'concert'),
            'fecha_evento' => $this->faker->dateTimeBetween('2025-06-01', '2026-12-31')->format('Y-m-d'),
        ];
    }

    /**
     * Crea un evento basado en una venue real europea.
     *
     * Asigna datos de venue realista (nombre, ubicación, coordenadas) al evento.
     *
     * @param array $venue Datos del venue desde RealVenues
     * @return $this Factory state
     */
    public function fromVenue($venue): static
    {
        return $this->state(function (array $attributes) use ($venue) {
            return [
                'url_venta' => $venue['url_venta'],
                'nombre' => $venue['nombre'] . ' ' . $this->faker->year(),
                'nombre_sala' => $venue['nombre_sala'],
                'ubicacion' => $venue['ubicacion'],
                'latitud' => $venue['latitud'],
                'longitud' => $venue['longitud'],
                'imagen' => $this->faker->imageUrl(800, 600, 'concert'),
                'fecha_evento' => $this->faker->dateTimeBetween('2025-06-01', '2026-12-31')->format('Y-m-d'),
            ];
        });
    }

    /**
     * Asigna géneros al evento (se sincronizarán en seeder).
     *
     * Almacena IDs de géneros para ser sincronizados después de creación.
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
