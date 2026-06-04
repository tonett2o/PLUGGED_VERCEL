<?php

namespace Database\Factories;

use App\Models\Hardware;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * HardwareFactory - Factory para generar datos de prueba de hardware
 *
 * Genera instancias fake de equipamiento de hardware musical con datos
 * realistas para pruebas, seeders y testing. Cada dispositivo creado tendrá:
 * - Nombre único del equipo
 * - Marca/fabricante
 * - Precio realista en euros
 * - Imagen/foto del dispositivo
 * - Descripción breve de características
 *
 * Tipos de hardware que puede generar:
 * - Sintetizadores y teclados
 * - Controladores MIDI
 * - Monitores y altavoces
 * - Interfaces de audio
 * - Microfonos y accesorios
 *
 * Uso en tests:
 * - Hardware::factory()->create() - Crea un dispositivo
 * - Hardware::factory()->count(10)->create() - Crea 10 dispositivos
 * - Hardware::factory()->create(['marca' => 'Native Instruments']) - Sobrescribe campos
 *
 * @extends Factory<Hardware>
 */
class HardwareFactory extends Factory
{
    /**
     * Define el estado predeterminado del modelo Hardware.
     *
     * Genera atributos aleatorios usando Faker para poblar un registro
     * de hardware con datos realistas pero ficticios.
     *
     * Atributos generados:
     * - nombre: palabra aleatoria + código modelo (ej: "Synthesizer MK42")
     * - marca: nombre de empresa como fabricante
     * - precio: número decimal entre €50 y €2000
     * - imagen: URL de imagen fake en categoría "device" (400x400)
     * - descripcion: párrafo corto aleatorio de características
     *
     * @return array<string, mixed> Atributos del hardware
     */
    public function definition(): array
    {
        return [
            'nombre' => $this->faker->unique()->word() . ' ' . $this->faker->numerify('MK#'),
            'marca' => $this->faker->company(),
            'precio' => $this->faker->randomFloat(2, 50, 2000),
            'imagen' => $this->faker->imageUrl(400, 400, 'device'),
            'descripcion' => $this->faker->paragraph(1),
        ];
    }
}
