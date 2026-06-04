<?php

namespace Database\Factories;

use App\Models\Software;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * SoftwareFactory - Factory para generar datos de prueba de software
 *
 * Genera instancias fake de aplicaciones/software musical con datos realistas
 * para pruebas, seeders y testing. Cada software creado tendrá:
 * - Nombre único de la aplicación
 * - Versión semántica realista
 * - Distribuidor/fabricante
 * - Precio en euros
 * - Logo/imagen del software
 * - Tipo de pago (compra única, suscripción, gratuito)
 * - Descripción breve
 *
 * Tipos de software que puede generar:
 * - DAWs (Logic, Ableton, FL Studio, Cubase, etc.)
 * - Plugins de síntesis y efectos
 * - Herramientas de masterización
 * - Software de edición de audio
 * - Herramientas de producción
 *
 * Uso en tests:
 * - Software::factory()->create() - Crea una aplicación
 * - Software::factory()->count(8)->create() - Crea 8 aplicaciones
 * - Software::factory()->create(['tipo_pago' => 'gratuito']) - Sobrescribe campos
 *
 * @extends Factory<Software>
 */
class SoftwareFactory extends Factory
{
    /**
     * Define el estado predeterminado del modelo Software.
     *
     * Genera atributos aleatorios usando Faker para poblar un registro
     * de software con datos realistas pero ficticios.
     *
     * Atributos generados:
     * - nombre: 2 palabras únicas como nombre de aplicación
     * - version: versión semántica realista (ej: 2.3.1)
     * - distribuidor: nombre de empresa como desarrollador
     * - precio: número decimal entre €0 y €500
     * - imagen: URL de imagen fake en categoría "tech" (400x400)
     * - tipo_pago: uno de [unico, mensual, anual, gratuito]
     * - descripcion: frase aleatoria de características
     *
     * @return array<string, mixed> Atributos del software
     */
    public function definition(): array
    {
        return [
            'nombre' => $this->faker->unique()->words(2, true),
            'version' => $this->faker->semver(),
            'distribuidor' => $this->faker->company(),
            'precio' => $this->faker->randomFloat(2, 0, 500),
            'imagen' => $this->faker->imageUrl(400, 400, 'tech'),
            'tipo_pago' => $this->faker->randomElement(['unico', 'mensual', 'anual', 'gratuito']),
            'descripcion' => $this->faker->sentence(),
        ];
    }
}
