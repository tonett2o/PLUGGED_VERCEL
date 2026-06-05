<?php

namespace Database\Seeders;

use App\Models\Cancion;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

/**
 * CancionPorDefectoSeeder - Crea una canción por defecto para la plataforma
 *
 * Esta canción se usa como referencia en colecciones, playlists y otros
 * contextos donde se necesita una canción por defecto.
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

        // Crear canción por defecto si no existe
        Cancion::firstOrCreate(
            ['titulo' => 'Default Track'],
            [
                'bpm' => 128,
                'tonalidad' => 'A',
                'estilo' => 'Electronic',
                'ubicacion' => 'audios/1QECXGjby1ICwbeV2mxsdVi5kdM0EXl5iFCBLHO2.mp3',
                'portada' => 'portadas/portada-default.jpg',
                'fecha_publicacion' => date('Y'),
                'privacidad' => 'publica',
                'id_usuario' => $usuarioSistema->id,
                'id_coleccion' => null
            ]
        );

        $this->command->info('✓ Default song created');
    }
}
