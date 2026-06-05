<?php

namespace Database\Seeders;

use App\Models\Cancion;
use App\Models\Usuario;
use App\Models\Coleccion;
use Illuminate\Database\Seeder;

/**
 * CancionPorDefectoSeeder - Crea una canción por defecto para la plataforma
 *
 * Esta canción se usa como referencia en colecciones, playlists y otros
 * contextos donde se necesita una canción por defecto.
 *
 * Estructura:
 * - Usuario "Sistema" (admin)
 * - Colección "Default" (singles)
 * - Canción "Default Track"
 */
class CancionPorDefectoSeeder extends Seeder
{
    /**
     * Ejecuta el seeder de canción por defecto.
     */
    public function run(): void
    {
        // Buscar o crear usuario "Sistema"
        $usuarioSistema = Usuario::firstOrCreate(
            ['email' => 'sistema@plugged.local'],
            [
                'nick' => 'Sistema',
                'nombre' => 'Sistema PLUGGED',
                'password' => bcrypt('password'),
                'rol' => 'admin',
                'email_verified_at' => now()
            ]
        );

        // Buscar o crear colección "Singles" del usuario (como en DatabaseSeeder)
        $coleccionSingles = Coleccion::firstOrCreate(
            ['titulo' => 'Singles', 'id_usuario' => $usuarioSistema->id],
            [
                'artista' => $usuarioSistema->nick,
                'tipo' => 'singles',
                'privacidad' => 'publica',
                'fecha_publicacion' => date('Y'),
                'portada' => 'portadas/portada-default.jpg',
                'protegida' => true
            ]
        );

        // Crear canción por defecto si no existe
        Cancion::firstOrCreate(
            ['titulo' => 'Default Track', 'id_usuario' => $usuarioSistema->id],
            [
                'bpm' => 128,
                'tonalidad' => 'A',
                'estilo' => 'Electronic',
                'ubicacion' => 'audios/1QECXGjby1ICwbeV2mxsdVi5kdM0EXl5iFCBLHO2.mp3',
                'portada' => 'portadas/portada-default.jpg',
                'fecha_publicacion' => date('Y'),
                'privacidad' => 'publica',
                'id_usuario' => $usuarioSistema->id,
                'id_coleccion' => $coleccionSingles->id
            ]
        );

        $this->command->info('✓ Sistema user with Singles collection and default song created');
    }
}
