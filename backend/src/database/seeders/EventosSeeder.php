<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Evento;
use App\Models\Usuario;
use App\Models\Estilo;

/**
 * EventosSeeder - Crea eventos desde venues reales europeos
 *
 * Genera 8-12 eventos usando datos reales de festivales y clubs europeos,
 * con géneros coherentes y organizadores asignados.
 */
class EventosSeeder extends Seeder
{
    /**
     * Ejecuta el seeding de eventos.
     *
     * Proceso:
     * 1. Carga datos de venues reales desde RealVenues.php
     * 2. Para cada venue, crea 1 evento usando fromVenue()
     * 3. Asigna géneros coherentes con el venue
     * 4. Asigna usuario organizador (productor aleatorio)
     * 5. Sincroniza géneros con eventos
     *
     * @return void
     */
    public function run(): void
    {
        // Cargar datos de venues
        $venues = require database_path('seeders/data/RealVenues.php');

        // Obtener todos los usuarios (productores creados antes)
        $usuarios = Usuario::all();
        $estilos = Estilo::all();

        foreach ($venues as $venue) {
            // Crear evento usando datos del venue
            $evento = Evento::factory()
                ->fromVenue($venue)
                ->create([
                    'id_usuario' => $usuarios->random()->id,
                ]);

            // Mapeo de géneros por venue
            $genreMap = [
                'Tomorrowland' => ['Trance', 'Progressive House', 'Uplifting Trance', 'Future Bass'],
                'Berghain' => ['Industrial Techno', 'Berlin Techno', 'Hard Techno'],
                'Printworks' => ['House', 'Techno', 'Drum & Bass', 'Tech House'],
                'Fabric' => ['Drum & Bass', 'House', 'Techno', 'Garage'],
                'Dekmantel' => ['House', 'Deep House', 'Techno', 'Ambient'],
                'Green Valley' => ['Techno', 'House', 'Deep House', 'Ambient'],
                'Awakenings' => ['House', 'Techno', 'Progressive House', 'Tech House'],
                'Time Warp' => ['Techno', 'Industrial Techno', 'Hard Techno', 'Detroit Techno'],
                'Monegros Festival' => ['House', 'Techno', 'Trance', 'Electro'],
                'Sensation Outdoor' => ['Progressive House', 'House', 'Trance', 'Future Bass'],
                'Elektra Festival' => ['House', 'Techno', 'Electronic'],
                'RTS.FM Warehouse' => ['Techno', 'House', 'Industrial Techno'],
                'Movement Festival' => ['Detroit Techno', 'House', 'Drum & Bass'],
            ];

            // Obtener géneros para este venue
            $venueGenres = $genreMap[$venue['nombre']] ?? $venue['estilos_primarios'];

            // Obtener IDs de estilos basados en nombres
            $genreIds = $estilos
                ->whereIn('nombre', $venueGenres)
                ->pluck('id')
                ->toArray();

            // Sincronizar géneros con evento
            if (!empty($genreIds)) {
                $evento->estilos()->sync($genreIds);
            }
        }
    }
}
