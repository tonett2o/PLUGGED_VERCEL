<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * EstilosSeeder - Seeder de géneros musicales electrónicos
 *
 * Carga el catálogo completo de 46 géneros/estilos musicales electrónicos
 * disponibles en la plataforma. Incluye:
 *
 * 8 Géneros principales:
 * - House, Techno, Trance, Drum & Bass, Dubstep, Deep House, Tech House, Minimal
 *
 * 38 Géneros secundarios/variaciones:
 * - Subgéneros de House: Progressive House, Acid House, Electro House, Future House
 * - Subgéneros de Techno: Industrial, Acid Techno, Detroit, Berlin, Hyperpop
 * - Subgéneros de Trance: Psytrance, Goa Trance, Hard, Progressive, Uplifting
 * - Subgéneros de Drum & Bass: Liquid Funk, Jump Up, Neurofunk, Jungle
 * - Subgéneros de Dubstep: Brostep, Riddim, Melodic Dubstep
 * - Otros: Synthwave, Retrowave, Darkwave, Chillwave, Vaporwave
 * - Experimental: Breakbeat, Ambient, Downtempo, Leftfield, IDM
 *
 * Cada género tiene:
 * - Nombre único
 * - Color hexadecimal para visualización en mapas y cards
 * - Timestamps de creación y actualización
 *
 * Los colores se seleccionan para diferenciar visualmente géneros relacionados:
 * - Azules y cian para House y variantes
 * - Rojos y naranjas para Techno y variantes industriales
 * - Amarillos y dorados para Trance
 * - Verdes para Drum & Bass y Jungle
 * - Púrpuras y rosas para Synthwave y experimental
 *
 * Uso: php artisan db:seed --class=EstilosSeeder
 * O automáticamente con: php artisan db:seed
 *
 * @package Database\Seeders
 */
class EstilosSeeder extends Seeder
{
    /**
     * Ejecuta el seeding de géneros musicales.
     *
     * Carga 46 géneros con sus colores asociados usando upsert()
     * para evitar errores si los géneros ya existen.
     *
     * Upsert behavior:
     * - Busca por columna 'nombre' (clave única)
     * - Si existe: actualiza color (pero generalmente será el mismo)
     * - Si no existe: inserta nuevo registro
     *
     * Esto permite ejecutar el seeder múltiples veces sin errores.
     *
     * @return void
     */
    public function run(): void
    {
        $estilos = [
            // 8 Principales
            ['nombre' => 'House', 'color' => '#0ADAF5'],
            ['nombre' => 'Techno', 'color' => '#FF006E'],
            ['nombre' => 'Trance', 'color' => '#FFD700'],
            ['nombre' => 'Drum & Bass', 'color' => '#00FF00'],
            ['nombre' => 'Dubstep', 'color' => '#FF7F00'],
            ['nombre' => 'Deep House', 'color' => '#00BFFF'],
            ['nombre' => 'Tech House', 'color' => '#FF1493'],
            ['nombre' => 'Minimal', 'color' => '#32CD32'],

            // 38 Secundarios - Variaciones y subcategorías
            ['nombre' => 'Progressive House', 'color' => '#1E90FF'],
            ['nombre' => 'Acid House', 'color' => '#00CED1'],
            ['nombre' => 'Electro House', 'color' => '#0099FF'],
            ['nombre' => 'Future House', 'color' => '#00FFFF'],
            ['nombre' => 'French Touch', 'color' => '#87CEEB'],
            ['nombre' => 'Soulful House', 'color' => '#6495ED'],

            ['nombre' => 'Industrial Techno', 'color' => '#DC143C'],
            ['nombre' => 'Acid Techno', 'color' => '#FF4500'],
            ['nombre' => 'Detroit Techno', 'color' => '#FF6347'],
            ['nombre' => 'Berlin Techno', 'color' => '#CD5C5C'],
            ['nombre' => 'Hyperpop Techno', 'color' => '#FF69B4'],

            ['nombre' => 'Psytrance', 'color' => '#FFB6C1'],
            ['nombre' => 'Goa Trance', 'color' => '#FFC0CB'],
            ['nombre' => 'Hard Trance', 'color' => '#FFD700'],
            ['nombre' => 'Progressive Trance', 'color' => '#FFED4E'],
            ['nombre' => 'Uplifting Trance', 'color' => '#FFFF00'],

            ['nombre' => 'Liquid Funk', 'color' => '#00FA9A'],
            ['nombre' => 'Jump Up', 'color' => '#3CB371'],
            ['nombre' => 'Neurofunk', 'color' => '#228B22'],
            ['nombre' => 'Jungle', 'color' => '#008000'],

            ['nombre' => 'Brostep', 'color' => '#FF8C00'],
            ['nombre' => 'Riddim', 'color' => '#FF7F50'],
            ['nombre' => 'Melodic Dubstep', 'color' => '#FFAA00'],
            ['nombre' => 'Riddim Dubstep', 'color' => '#FF9500'],

            ['nombre' => 'Synthwave', 'color' => '#FF00FF'],
            ['nombre' => 'Retrowave', 'color' => '#FF1493'],
            ['nombre' => 'Darkwave', 'color' => '#8B008B'],
            ['nombre' => 'Chillwave', 'color' => '#9932CC'],
            ['nombre' => 'Vaporwave', 'color' => '#DA70D6'],

            ['nombre' => 'Breakbeat', 'color' => '#00CED1'],
            ['nombre' => 'Drum & Bass Liquid', 'color' => '#20B2AA'],
            ['nombre' => 'Ambient', 'color' => '#4169E1'],
            ['nombre' => 'Downtempo', 'color' => '#6A5ACD'],
            ['nombre' => 'Leftfield', 'color' => '#9370DB'],
            ['nombre' => 'IDM', 'color' => '#BA55D3'],
            ['nombre' => 'Experimental', 'color' => '#DDA0DD'],
        ];

        DB::table('estilos')->upsert($estilos, ['nombre'], ['color']);
    }
}
