<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Reproduccion;
use App\Models\Cancion;
use Carbon\Carbon;
use Faker\Factory as Faker;

/**
 * ReproduccionesSeeder - Genera histórico realista de reproducciones
 *
 * Crea 100-200 reproducciones distribuidas según la regla 80/20:
 * - 20% de las canciones concentran el 80% de reproducciones
 * - Canciones nuevas tienen reproducciones recientes
 * - Canciones antiguas tienen mayor número acumulado de reproducciones
 * - Distribución realista de timeline (más plays en años anteriores)
 */
class ReproduccionesSeeder extends Seeder
{
    /**
     * Ejecuta el seeding de reproducciones.
     *
     * Proceso:
     * 1. Obtiene todas las canciones ordenadas por fecha_publicacion
     * 2. Distribuye canciones en dos grupos: "populares" (20%) y "regulares" (80%)
     * 3. Asigna reproducciones a cada canción:
     *    - Canciones populares: 40-200 reproducciones
     *    - Canciones regulares: 2-20 reproducciones
     * 4. Genera timestamps realistas para cada reproducción
     * 5. Canciones antiguas tienen reproducciones distribuidas en el tiempo
     * 6. Canciones recientes tienen reproducciones recientes
     *
     * @return void
     */
    public function run(): void
    {
        $faker = Faker::create();
        $canciones = Cancion::all();

        if ($canciones->isEmpty()) {
            $this->command->info('No canciones found. Skipping reproducciones seeding.');
            return;
        }

        // Calcular cuántas canciones son "populares" (20%)
        $totalCanciones = $canciones->count();
        $popularCount = max(1, (int)($totalCanciones * 0.20));

        // Separar canciones en populares y regulares
        // Las más recientes son más populares
        $populares = $canciones->sortByDesc('fecha_publicacion')->take($popularCount);
        $regulares = $canciones->diff($populares);

        // Crear reproducciones para canciones populares (40-200)
        foreach ($populares as $cancion) {
            $numReproducciones = $faker->numberBetween(40, 200);
            $this->createReproduccionesForCancion($cancion, $numReproducciones, $faker);
        }

        // Crear reproducciones para canciones regulares (2-20)
        foreach ($regulares as $cancion) {
            $numReproducciones = $faker->numberBetween(2, 20);
            $this->createReproduccionesForCancion($cancion, $numReproducciones, $faker);
        }

        $this->command->info('Reproducciones seeding completed successfully.');
    }

    /**
     * Crea reproducciones para una canción específica.
     *
     * Genera timestamps realistas basados en la antigüedad de la canción.
     * Canciones más recientes tienen reproducciones recientes.
     * Canciones antiguas tienen reproducciones distribuidas en el pasado.
     *
     * @param Cancion $cancion Canción para la que crear reproducciones
     * @param int $count Número de reproducciones a crear
     * @param object $faker Instancia de Faker para generar datos
     * @return void
     */
    private function createReproduccionesForCancion(Cancion $cancion, int $count, $faker): void
    {
        $publicationYear = (int)$cancion->fecha_publicacion;
        $yearsSincePub = now()->year - $publicationYear;

        // Rango de fechas: desde publicación hasta hoy
        $startDate = Carbon::create($publicationYear, 1, 1);
        $endDate = now();

        for ($i = 0; $i < $count; $i++) {
            // Distribución más pesada hacia fechas recientes
            // 60% de reproducciones en el último año
            if ($faker->boolean(60)) {
                $date = Carbon::instance($faker->dateTimeBetween(
                    Carbon::now()->subYear(),
                    now()
                ));
            } else {
                // 40% distribuidas en todo el tiempo disponible
                $date = Carbon::instance($faker->dateTimeBetween(
                    $startDate,
                    $endDate
                ));
            }

            Reproduccion::create([
                'id_cancion' => $cancion->id,
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }
    }
}
