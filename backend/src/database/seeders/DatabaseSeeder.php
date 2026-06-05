<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuario;
use App\Models\Coleccion;
use App\Models\Cancion;
use App\Models\Playlist;
use App\Models\Software;
use App\Models\Hardware;
use App\Models\Evento;
use App\Models\Estilo;

/**
 * DatabaseSeeder - Seeder principal para poblar datos de prueba realistas
 *
 * Este seeder genera un conjunto coherente y realista de datos de prueba
 * para toda la plataforma, incluyendo:
 *
 * 1. Equipamiento real (hardware y software) - mediante EquipamientoRealSeeder
 * 2. Géneros musicales (estilos) - mediante EstilosSeeder
 * 3. 15 productores europeos coherentes con ProducerPersonas
 * 4. Software y hardware específico para cada productor según su género
 * 5. Eventos desde venues reales europeos - mediante EventosSeeder
 * 6. Géneros en canciones basados en género del productor
 * 7. Géneros en eventos basados en venue
 * 8. Colecciones (álbumes, EPs) por productor
 * 9. Canciones con géneros coherentes
 * 10. Reproducciones realistas distribuidas - mediante ReproduccionesSeeder
 * 11. Imágenes de galería temáticas - mediante GaleriaSeeder
 * 12. Relaciones de seguimiento basadas en género (3-4 "escenas")
 * 13. Colaboraciones entre productores del mismo género
 * 14. Comentarios variados específicos del género
 * 15. Likes realistas (usuarios siguen productores similares)
 *
 * El resultado es una base de datos completamente poblada con datos coherentes:
 * - Productores europeos reales agrupados por escena/género
 * - Equipamiento que coincide con el género del productor
 * - Canciones y eventos con géneros musicales apropiados
 * - Redes sociales realistas dentro de comunidades de género
 * - Histórico de reproducciones distribuido realista
 *
 * Usar: php artisan migrate:fresh --seed
 *
 * @package Database\Seeders
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Ejecuta el seeding realista de la base de datos.
     *
     * Proceso:
     * 1. Carga equipamiento real (EquipamientoRealSeeder)
     * 2. Carga géneros musicales (EstilosSeeder)
     * 3. Carga datos de ProducerPersonas y crea 15 usuarios coherentes
     * 4. Asigna géneros a cada usuario basado en su persona
     * 5. Asigna equipamiento específico a cada usuario
     * 6. Crea eventos desde venues reales (EventosSeeder)
     * 7. Crea colecciones y canciones por usuario
     * 8. Asigna géneros a canciones basado en usuario creador
     * 9. Crea redes de seguimiento dentro de géneros (3-4 escenas)
     * 10. Crea colaboraciones entre productores del mismo género
     * 11. Asigna likes realistas (usuarios siguen usuarios similares)
     * 12. Crea comentarios variados y género-específicos
     * 13. Genera reproducciones realistas (ReproduccionesSeeder)
     * 14. Añade imágenes de galería temáticas (GaleriaSeeder)
     *
     * @return void
     */
    public function run(): void
    {
        // Canción por defecto (primero para que exista)
        $this->call(CancionPorDefectoSeeder::class);

        // Equipamiento real
        $this->call(EquipamientoRealSeeder::class);

        // Géneros musicales
        $this->call(EstilosSeeder::class);

        // Cargar datos de personas y crear usuarios coherentes
        $personas = require database_path('seeders/data/ProducerPersonas.php');
        $softwares = Software::all();
        $hardwares = Hardware::all();
        $estilos = Estilo::all();

        // Crear usuarios desde personas
        $usuariosPorEscena = [];
        $usuarios = collect();

        foreach ($personas as $persona) {
            $usuario = Usuario::factory()
                ->withPersona($persona)
                ->create();

            // Asignar géneros al usuario
            if (!empty($persona['estilos_primarios'])) {
                $estilo_ids = $estilos
                    ->whereIn('nombre', $persona['estilos_primarios'])
                    ->pluck('id')
                    ->toArray();

                if (!empty($estilo_ids)) {
                    $usuario->estilos()->sync($estilo_ids);
                }
            }

            // Asignar equipamiento específico del productor
            if (!empty($persona['hardware_ids'])) {
                $usuario->hardwares()->attach(
                    $hardwares->whereIn('id', $persona['hardware_ids'])->pluck('id')
                );
            }

            if (!empty($persona['software_ids'])) {
                $usuario->softwares()->attach(
                    $softwares->whereIn('id', $persona['software_ids'])->pluck('id')
                );
            }

            // 🆕 Crear colecciones y playlists especiales
            // Colección "Singles" protegida
            $usuario->colecciones()->create([
                'titulo' => 'Singles',
                'artista' => $usuario->nick,
                'tipo' => 'singles',
                'privacidad' => 'publica',
                'fecha_publicacion' => date('Y'),
                'portada' => 'portadas/portada-default.jpg',
                'protegida' => true,
            ]);

            // Playlist "Me gusta" protegida
            $usuario->playlists()->create([
                'titulo' => 'Me gusta',
                'artista' => $usuario->nick,
                'privacidad' => 'publica',
                'fecha_publicacion' => date('Y'),
                'portada' => 'portadas/portada-default.jpg',
                'protegida' => true,
            ]);

            // Agrupar usuarios por escena (primer género primario)
            $escena = $persona['estilos_primarios'][0] ?? 'other';
            if (!isset($usuariosPorEscena[$escena])) {
                $usuariosPorEscena[$escena] = [];
            }
            $usuariosPorEscena[$escena][] = $usuario;

            $usuarios->push($usuario);
        }

        // Crear eventos desde venues reales
        $this->call(EventosSeeder::class);

        // Crear contenido para cada usuario
        foreach ($usuarios as $usuario) {
            // 2 playlists por usuario
            $misPlaylists = Playlist::factory(2)->create(['id_usuario' => $usuario->id]);

            // 2 colecciones por usuario
            $colecciones = Coleccion::factory(2)->create(['id_usuario' => $usuario->id]);

            foreach ($colecciones as $coleccion) {
                // 4-6 canciones por colección
                $numCanciones = rand(4, 6);
                $canciones = Cancion::factory($numCanciones)->create([
                    'id_coleccion' => $coleccion->id,
                    'id_usuario' => $usuario->id
                ]);

                foreach ($canciones as $cancion) {
                    // Asignar géneros a la canción basados en usuario creador
                    $generoIds = $usuario->estilos()
                        ->pluck('estilos.id')
                        ->toArray();

                    if (!empty($generoIds)) {
                        // 1-3 géneros por canción
                        $numGeneros = min(rand(1, 3), count($generoIds));
                        $generosAleatorios = collect($generoIds)
                            ->random($numGeneros)
                            ->toArray();
                        $cancion->estilos()->sync($generosAleatorios);
                    }

                    // Las playlists se crean vacías - el usuario agrega canciones manualmente
                    // No se asignan canciones automáticamente a playlists en el seeder

                    // Likes realistas: usuarios que siguen productores similares
                    $likesAleatorios = $this->getRealisticLikers(
                        $usuario,
                        $usuariosPorEscena,
                        $usuarios,
                        rand(2, 5)
                    );
                    if (!empty($likesAleatorios)) {
                        $cancion->likes()->attach($likesAleatorios);
                    }

                    // Comentarios variados y específicos del género
                    $comentadores = $this->getRealisticCommentadores(
                        $usuario,
                        $usuariosPorEscena,
                        $usuarios,
                        rand(1, 3)
                    );

                    foreach ($comentadores as $comentador) {
                        $texto = $this->getGenreSpecificComment(
                            $usuario->estilos()->pluck('nombre')->first()
                        );

                        $cancion->comentarios()->attach($comentador->id, [
                            'texto' => $texto,
                            'segundo' => rand(1, 150)
                        ]);
                    }
                }
            }
        }

        // Crear redes de seguimiento dentro de escenas (80% follow chance within scene)
        foreach ($usuariosPorEscena as $escena => $usuariosEscena) {
            foreach ($usuariosEscena as $usuario) {
                // Seguir 2-4 usuarios dentro de la misma escena
                $otrosEnEscena = collect($usuariosEscena)
                    ->where('id', '!=', $usuario->id);

                if ($otrosEnEscena->count() > 0) {
                    $numSeguir = min(rand(2, 4), $otrosEnEscena->count());
                    $usuariosASeguir = $otrosEnEscena->random($numSeguir)->pluck('id');
                    $usuario->seguidos()->attach($usuariosASeguir);
                }
            }
        }

        // Crear colaboraciones entre productores del mismo género
        foreach ($usuariosPorEscena as $escena => $usuariosEscena) {
            for ($i = 0; $i < count($usuariosEscena); $i++) {
                if (rand(1, 100) <= 40) { // 40% chance de crear colaboración
                    $usuario1 = $usuariosEscena[$i];
                    $usuarioColaborador = $usuariosEscena[array_rand($usuariosEscena)];

                    if ($usuarioColaborador->id !== $usuario1->id) {
                        // Crear una colección colaborativa
                        $coleccionColaborativa = Coleccion::factory()->create([
                            'id_usuario' => $usuario1->id
                        ]);

                        // Agregar colaborador
                        if (method_exists($coleccionColaborativa, 'colaboradores')) {
                            $coleccionColaborativa->colaboradores()->attach($usuarioColaborador->id);
                        }

                        // Crear 2-3 canciones para la colección
                        $numCanciones = rand(2, 3);
                        $canciones = Cancion::factory($numCanciones)->create([
                            'id_coleccion' => $coleccionColaborativa->id,
                            'id_usuario' => $usuario1->id
                        ]);

                        // Asignar géneros
                        foreach ($canciones as $cancion) {
                            $generoIds = $usuario1->estilos()
                                ->pluck('estilos.id')
                                ->toArray();

                            if (!empty($generoIds)) {
                                $numGeneros = min(rand(1, 2), count($generoIds));
                                $generosAleatorios = collect($generoIds)
                                    ->random($numGeneros)
                                    ->toArray();
                                $cancion->estilos()->sync($generosAleatorios);
                            }
                        }
                    }
                }
            }
        }

        // Reproducciones realistas
        $this->call(ReproduccionesSeeder::class);

        // Imágenes de galería temáticas
        $this->call(GaleriaSeeder::class);

        $this->command->info('Database seeded with realistic, coherent data!');
        $this->command->info('- 15 European producers with matching equipment and genres');
        $this->command->info('- Real European festivals and clubs as event venues');
        $this->command->info('- Coherent genres in songs and events');
        $this->command->info('- 3-4 music scenes/communities with realistic follow networks');
        $this->command->info('- Meaningful collaborations between similar producers');
        $this->command->info('- Faker songs with real audio files');
        $this->command->info('- Realistic play history and gallery images');
    }

    /**
     * Obtiene likers realistas para una canción.
     *
     * Los usuarios que dan like son principalmente del mismo género/escena.
     *
     * @param Usuario $creator Creador de la canción
     * @param array $usuariosPorEscena Usuarios agrupados por escena
     * @param mixed $todosUsuarios Todos los usuarios
     * @param int $numLikes Número de likes deseado
     * @return array IDs de usuarios que darán like
     */
    private function getRealisticLikers(Usuario $creator, array $usuariosPorEscena, mixed $todosUsuarios, int $numLikes): array
    {
        $generoPrimario = $creator->estilos()->pluck('estilos.nombre')->first();
        $usuariosEscena = $usuariosPorEscena[$generoPrimario] ?? [];

        // Filtrar usuario creator
        $usuariosEscena = collect($usuariosEscena)
            ->where('id', '!=', $creator->id);

        $likers = [];

        // 70% de likes de la misma escena
        if ($usuariosEscena->count() > 0) {
            $numDesdeEscena = (int)($numLikes * 0.70);
            $numDesdeEscena = min($numDesdeEscena, $usuariosEscena->count());
            $likerEscena = $usuariosEscena->random($numDesdeEscena);
            $likers = array_merge($likers, $likerEscena->pluck('id')->toArray());
        }

        // 30% de likes aleatorios de otros
        $numRestante = $numLikes - count($likers);
        if ($numRestante > 0) {
            $otrosUsuarios = $todosUsuarios->where('id', '!=', $creator->id);
            $numOtros = min($numRestante, $otrosUsuarios->count());
            if ($numOtros > 0) {
                $likerOtros = $otrosUsuarios->random($numOtros);
                $likers = array_merge($likers, $likerOtros->pluck('id')->toArray());
            }
        }

        return array_unique($likers);
    }

    /**
     * Obtiene comentadores realistas para una canción.
     *
     * Los que comentan son principalmente usuarios de la misma escena/género.
     *
     * @param Usuario $creator
     * @param array $usuariosPorEscena
     * @param mixed $todosUsuarios
     * @param int $numComentarios
     * @return \Illuminate\Support\Collection
     */
    private function getRealisticCommentadores(Usuario $creator, array $usuariosPorEscena, mixed $todosUsuarios, int $numComentarios): \Illuminate\Support\Collection
    {
        $generoPrimario = $creator->estilos()->pluck('estilos.nombre')->first();
        $usuariosEscena = $usuariosPorEscena[$generoPrimario] ?? [];

        $usuariosEscena = collect($usuariosEscena)
            ->where('id', '!=', $creator->id);

        $comentadores = collect();

        // 75% de comentarios de la misma escena
        if ($usuariosEscena->count() > 0) {
            $numDesdeEscena = (int)($numComentarios * 0.75);
            $numDesdeEscena = min($numDesdeEscena, $usuariosEscena->count());
            if ($numDesdeEscena > 0) {
                $comentEscena = $usuariosEscena->random($numDesdeEscena);
                $comentadores = $comentadores->merge($comentEscena);
            }
        }

        // 25% de otros usuarios
        $numRestante = $numComentarios - $comentadores->count();
        if ($numRestante > 0) {
            $otrosUsuarios = $todosUsuarios->where('id', '!=', $creator->id);
            $numOtros = min($numRestante, $otrosUsuarios->count());
            if ($numOtros > 0) {
                $comentOtros = $otrosUsuarios->random($numOtros);
                $comentadores = $comentadores->merge($comentOtros);
            }
        }

        return $comentadores->unique('id');
    }

    /**
     * Genera comentario variado específico del género musical.
     *
     * @param string|null $genero Género primario de la canción
     * @return string
     */
    private function getGenreSpecificComment(?string $genero): string
    {
        $comentarios = [
            'Techno' => [
                '🔥 Heavy stuff, love the industrial vibes',
                'Warehouse anthem right here',
                'The grooves on this are immaculate',
                'Perfect for a 4am peak time set',
                'Love the texture and layers',
                'Absolutely hypnotic production',
            ],
            'House' => [
                '🎵 Beautiful groove, perfect for sunrise',
                'The energy on this is infectious',
                'Love the warm pads underneath',
                'Such a feel-good vibe',
                'This would bang in a festival',
                'The bassline is everything',
            ],
            'Deep House' => [
                'Soulful and smooth, love it',
                'The depth here is incredible',
                'Perfect deep house grooves',
                'Moody and beautiful production',
                'This speaks to the soul',
                'Absolutely mesmerizing',
            ],
            'Trance' => [
                '✨ The melodies on this are out of this world',
                'Uplifting and euphoric, perfect',
                'This builds beautifully',
                'The synths are absolutely gorgeous',
                'Pure trance magic',
                'Takes you on a journey',
            ],
            'Drum & Bass' => [
                '🎙️ The breaks on this hit different',
                'Liquid vibes with that energy',
                'Absolutely tight production',
                'The drums are firing on all cylinders',
                'Jungle energy runs deep',
                'Sick reese bass',
            ],
            'Electro' => [
                'Retro-futuristic vibes on point',
                'The synth stabs are killer',
                'Love the analog warmth',
                'This is proper electro',
                'Filthy bass work here',
                'Absolutely funky',
            ],
        ];

        $comentariosGenericos = [
            'Great production quality',
            'Love the creativity here',
            'Keep it up! 🔥',
            'This is fire',
            'Amazing work!',
            'Impressive sound design',
            'Really enjoyed this',
            'Professional level stuff',
            'The mix is really clean',
            'Loved every second',
        ];

        if (isset($comentarios[$genero])) {
            return $comentarios[$genero][array_rand($comentarios[$genero])];
        }

        return $comentariosGenericos[array_rand($comentariosGenericos)];
    }
}