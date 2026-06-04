<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * EquipamientoRealSeeder - Seeder de equipamiento real de producción musical
 *
 * Carga un catálogo realista y profesional de hardware y software real utilizado
 * en la industria de la producción musical electrónica.
 *
 * Hardware incluido (14 equipos):
 * - DJ Gear: Mezcladores, tocadiscos, reproductores profesionales (Pioneer, Technics)
 * - Monitores de estudio: Neumann, Yamaha, KRK
 * - Sintetizadores: Roland TR-909, Moog Sub 37, Korg Minilogue
 * - Controladores: Ableton Push 3, Native Instruments Maschine
 *
 * Software incluido (12 aplicaciones):
 * - DAWs: Ableton Live, FL Studio, Logic Pro, Bitwig Studio
 * - Plugins VST: Serum, Omnisphere, FabFilter, iZotope Ozone
 * - DJ Software: Rekordbox, Traktor Pro, Serato DJ Pro
 *
 * Características:
 * - Datos reales de productos profesionales
 * - Precios en euros realistas
 * - Descripciones detalladas
 * - Trunca tablas para limpiar datos anteriores
 * - Desactiva validación de claves foráneas durante inserción
 *
 * Uso: Llamado automáticamente por DatabaseSeeder
 *
 * @package Database\Seeders
 */
class EquipamientoRealSeeder extends Seeder
{
    /**
     * Ejecuta el seeding de equipamiento real.
     *
     * Proceso:
     * 1. Desactiva validación de claves foráneas (FOREIGN_KEY_CHECKS=0)
     * 2. Trunca tablas existentes (hardware y software)
     * 3. Reactiva validación de claves foráneas
     * 4. Inserta array de hardware con datos reales
     * 5. Inserta array de software con datos reales
     *
     * Los datos incluyen productos profesionales utilizados por productores
     * y DJs reales en la escena de música electrónica.
     *
     * @return void
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('hardware')->truncate();
        DB::table('software')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // --- HARDWARE (Mixers, Tocadiscos, Monitores, Sintetizadores) ---
        $hardware = [
            // DJ Gear
            ['nombre' => 'DJM-A9', 'marca' => 'Pioneer DJ', 'precio' => 2799.00, 'imagen' => 'gear/djm_a9.png', 'descripcion' => 'Mezclador club estándar 4 canales'],
            ['nombre' => 'Xone:96', 'marca' => 'Allen & Heath', 'precio' => 1999.00, 'imagen' => 'gear/xone96.png', 'descripcion' => 'Mezclador analógico de alta fidelidad'],
            ['nombre' => 'CDJ-3000', 'marca' => 'Pioneer DJ', 'precio' => 2499.00, 'imagen' => 'gear/cdj3000.png', 'descripcion' => 'Reproductor multiformato profesional'],
            ['nombre' => 'SL-1200MK7', 'marca' => 'Technics', 'precio' => 999.00, 'imagen' => 'gear/technics.png', 'descripcion' => 'Tocadiscos legendario para DJs'],
            ['nombre' => 'PLX-1000', 'marca' => 'Pioneer DJ', 'precio' => 699.00, 'imagen' => 'gear/plx1000.png', 'descripcion' => 'Tocadiscos de alta precisión'],
            
            // Studio Monitors
            ['nombre' => 'KH 120 II', 'marca' => 'Neumann', 'precio' => 1800.00, 'imagen' => 'gear/neumann.png', 'descripcion' => 'Monitores de estudio campo cercano'],
            ['nombre' => 'HS8', 'marca' => 'Yamaha', 'precio' => 700.00, 'imagen' => 'gear/yamaha_hs8.png', 'descripcion' => 'Estándar de la industria en estudio'],
            ['nombre' => 'VXT8', 'marca' => 'KRK', 'precio' => 900.00, 'imagen' => 'gear/krk.png', 'descripcion' => 'Monitores con gran respuesta de graves'],
            
            // Synthesizers & Drum Machines
            ['nombre' => 'TR-909', 'marca' => 'Roland', 'precio' => 3500.00, 'imagen' => 'gear/tr909.png', 'descripcion' => 'Caja de ritmos analógica histórica'],
            ['nombre' => 'OB-6', 'marca' => 'Sequential', 'precio' => 3200.00, 'imagen' => 'gear/ob6.png', 'descripcion' => 'Sintetizador analógico polifónico'],
            ['nombre' => 'Sub 37', 'marca' => 'Moog', 'precio' => 1600.00, 'imagen' => 'gear/moog.png', 'descripcion' => 'Sinte monofónico legendario'],
            ['nombre' => 'Minilogue XD', 'marca' => 'Korg', 'precio' => 600.00, 'imagen' => 'gear/minilogue.png', 'descripcion' => 'Sinte híbrido polifónico versátil'],
            ['nombre' => 'Push 3', 'marca' => 'Ableton', 'precio' => 950.00, 'imagen' => 'gear/push3.png', 'descripcion' => 'Controlador táctil para Ableton'],
            ['nombre' => 'Maschine MK3', 'marca' => 'Native Instruments', 'precio' => 500.00, 'imagen' => 'gear/maschine.png', 'descripcion' => 'Sistema de producción integral'],
        ];

        // --- SOFTWARE (DAWs, VSTs, Plugins, DJ Software) ---
        $software = [
            // DAWs
            ['nombre' => 'Ableton Live 12', 'version' => '12.0', 'distribuidor' => 'Ableton', 'precio' => 599.00, 'imagen' => 'sw/ableton.png', 'tipo_pago' => 'unico', 'descripcion' => 'El rey para producción electrónica'],
            ['nombre' => 'FL Studio 21', 'version' => '21.2', 'distribuidor' => 'Image-Line', 'precio' => 199.00, 'imagen' => 'sw/fl.png', 'tipo_pago' => 'unico', 'descripcion' => 'Favorito para música urbana y electrónica'],
            ['nombre' => 'Logic Pro X', 'version' => '11.0', 'distribuidor' => 'Apple', 'precio' => 229.00, 'imagen' => 'sw/logic.png', 'tipo_pago' => 'unico', 'descripcion' => 'Potencia creativa para Mac'],
            ['nombre' => 'Bitwig Studio', 'version' => '5.0', 'distribuidor' => 'Bitwig', 'precio' => 399.00, 'imagen' => 'sw/bitwig.png', 'tipo_pago' => 'unico', 'descripcion' => 'DAW moderno con modulación modular'],
            
            // Plugins VST
            ['nombre' => 'Serum', 'version' => '1.3', 'distribuidor' => 'Xfer Records', 'precio' => 189.00, 'imagen' => 'sw/serum.png', 'tipo_pago' => 'unico', 'descripcion' => 'Sintetizador wavetable estándar'],
            ['nombre' => 'Omnisphere 2', 'version' => '2.8', 'distribuidor' => 'Spectrasonics', 'precio' => 499.00, 'imagen' => 'sw/omni.png', 'tipo_pago' => 'unico', 'descripcion' => 'La biblioteca sónica definitiva'],
            ['nombre' => 'FabFilter Pro-Q 3', 'version' => '3.0', 'distribuidor' => 'FabFilter', 'precio' => 164.00, 'imagen' => 'sw/fabfilter.png', 'tipo_pago' => 'unico', 'descripcion' => 'Ecualizador paramétrico quirúrgico'],
            ['nombre' => 'Ozone 11', 'version' => '11.0', 'distribuidor' => 'iZotope', 'precio' => 499.00, 'imagen' => 'sw/ozone.png', 'tipo_pago' => 'unico', 'descripcion' => 'Suite de mastering asistida por AI'],
            ['nombre' => 'Auto-Tune Pro', 'version' => '11.0', 'distribuidor' => 'Antares', 'precio' => 450.00, 'imagen' => 'sw/autotune.png', 'tipo_pago' => 'unico', 'descripcion' => 'Corrección de tono profesional'],
            
            // DJ Software
            ['nombre' => 'Rekordbox', 'version' => '7.0', 'distribuidor' => 'Pioneer DJ', 'precio' => 0.00, 'imagen' => 'sw/rekordbox.png', 'tipo_pago' => 'gratuito', 'descripcion' => 'Gestor de bibliotecas DJ'],
            ['nombre' => 'Traktor Pro 4', 'version' => '4.0', 'distribuidor' => 'Native Instruments', 'precio' => 99.00, 'imagen' => 'sw/traktor.png', 'tipo_pago' => 'unico', 'descripcion' => 'Software de mezcla creativa'],
            ['nombre' => 'Serato DJ Pro', 'version' => '3.1', 'distribuidor' => 'Serato', 'precio' => 249.00, 'imagen' => 'sw/serato.png', 'tipo_pago' => 'unico', 'descripcion' => 'Software de mezcla estándar en club'],
        ];

        DB::table('hardware')->insert($hardware);
        DB::table('software')->insert($software);
    }
}