<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ImagenGaleria;
use App\Models\Usuario;
use Faker\Factory as Faker;
use Carbon\Carbon;

/**
 * GaleriaSeeder - Añade imágenes de galería a perfiles de usuarios
 *
 * Crea 2-4 imágenes de galería por usuario, con categorías temáticas
 * basadas en los estilos primarios del productor:
 * - Techno/Industrial: imágenes oscuras, industriales
 * - House/Deep House: imágenes coloridas, cálidas, abstractas
 * - Trance: imágenes cósmicas, espaciales
 * - Drum & Bass: imágenes urbanas, neón, dinámicas
 * - Electro: imágenes retro, coloreadas
 * - Ambient/Downtempo: imágenes naturales, minimalistas
 *
 * Las imágenes se utilizan en perfiles de usuario para mostrar
 * galería visual del productor/DJ.
 */
class GaleriaSeeder extends Seeder
{
    /**
     * Categorías de imágenes según género musical.
     *
     * @var array
     */
    private array $imagenCategorias = [
        'Industrial Techno' => ['industrial', 'dark', 'abstract'],
        'Berlin Techno' => ['industrial', 'warehouse', 'dark'],
        'Hard Techno' => ['dark', 'industrial', 'electronic'],
        'Techno' => ['industrial', 'tech', 'dark'],
        'House' => ['colorful', 'abstract', 'dance'],
        'Deep House' => ['warm', 'abstract', 'colorful'],
        'Progressive House' => ['colorful', 'dance', 'abstract'],
        'Tech House' => ['tech', 'colorful', 'abstract'],
        'Trance' => ['cosmic', 'space', 'colorful'],
        'Uplifting Trance' => ['cosmic', 'colorful', 'uplifting'],
        'Future Bass' => ['cosmic', 'colorful', 'futuristic'],
        'Drum & Bass' => ['urban', 'neon', 'dynamic'],
        'Garage' => ['urban', 'dark', 'abstract'],
        'Electro' => ['retro', 'colorful', 'tech'],
        'Ambient' => ['nature', 'minimal', 'calm'],
        'Downtempo' => ['warm', 'nature', 'calm'],
        'Electronic' => ['tech', 'abstract', 'colorful'],
        'Trance Energy' => ['cosmic', 'colorful', 'dynamic'],
        'Detroit Techno' => ['industrial', 'retro', 'dark'],
    ];

    /**
     * Ejecuta el seeding de imágenes de galería.
     *
     * Proceso:
     * 1. Obtiene todos los usuarios
     * 2. Para cada usuario:
     *    - Determina sus estilos primarios (si tiene datos de persona)
     *    - Selecciona 2-4 categorías temáticas basadas en estilos
     *    - Crea 2-4 imágenes con esas categorías
     * 3. Cada imagen obtiene URL fake de imagen con la categoría adecuada
     *
     * @return void
     */
    public function run(): void
    {
        $faker = Faker::create();
        $usuarios = Usuario::all();

        if ($usuarios->isEmpty()) {
            $this->command->info('No usuarios found. Skipping galeria seeding.');
            return;
        }

        foreach ($usuarios as $usuario) {
            // Obtener categorías basadas en estilos del usuario
            $categorias = $this->getCategoriesForUsuario($usuario);

            // Crear 2-4 imágenes
            $numImagenes = $faker->numberBetween(2, 4);

            for ($i = 0; $i < $numImagenes; $i++) {
                // Seleccionar categoría aleatoria del usuario
                $categoria = $faker->randomElement($categorias);

                $date = Carbon::instance($faker->dateTimeBetween('-6 months'));

                ImagenGaleria::create([
                    'id_usuario' => $usuario->id,
                    'imagen' => 'portadas/logo-plugged.jpg', // Usar logo de PLUGGED
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);
            }
        }

        $this->command->info('Galeria seeding completed successfully.');
    }

    /**
     * Obtiene las categorías de imagen apropiadas para un usuario.
     *
     * Basadas en sus estilos primarios o rol, elige categorías temáticas.
     *
     * @param Usuario $usuario
     * @return array
     */
    private function getCategoriesForUsuario(Usuario $usuario): array
    {
        $estilos = $usuario->estilos()->pluck('nombre')->toArray();

        if (empty($estilos)) {
            // Si no tiene estilos, usar por defecto basado en rol
            if ($usuario->rol === 'productor') {
                return ['tech', 'abstract', 'colorful'];
            }
            return ['dance', 'colorful', 'abstract'];
        }

        // Recopilar categorías de todos los estilos del usuario
        $allCategorias = [];
        foreach ($estilos as $estilo) {
            if (isset($this->imagenCategorias[$estilo])) {
                $allCategorias = array_merge($allCategorias, $this->imagenCategorias[$estilo]);
            }
        }

        // Eliminar duplicados y devolver
        return !empty($allCategorias) ? array_unique($allCategorias) : ['abstract', 'colorful'];
    }

    /**
     * Genera descripción para imagen basada en categoría.
     *
     * @param string $categoria
     * @return string
     */
    private function generateDescripcion(string $categoria): string
    {
        $descripciones = [
            'industrial' => 'Vibes industriales del studio',
            'dark' => 'Dark atmosphere set',
            'abstract' => 'Obra visual abstracta',
            'warehouse' => 'Warehouse session',
            'electronic' => 'Electronic production vibes',
            'colorful' => 'Colorful production aesthetic',
            'dance' => 'Dance floor energy',
            'warm' => 'Warm deep house vibes',
            'tech' => 'Tech production space',
            'cosmic' => 'Cosmic trance energy',
            'space' => 'Intergalactic vibes',
            'uplifting' => 'Uplifting moment',
            'futuristic' => 'Future bass frontier',
            'urban' => 'Urban energy',
            'neon' => 'Neon city lights',
            'dynamic' => 'Dynamic production flow',
            'retro' => 'Retro electro vibes',
            'nature' => 'Natural inspiration',
            'minimal' => 'Minimal aesthetic',
            'calm' => 'Ambient calm',
        ];

        return $descripciones[$categoria] ?? 'Studio moment';
    }
}
