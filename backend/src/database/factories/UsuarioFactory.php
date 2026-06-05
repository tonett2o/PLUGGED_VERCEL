<?php

namespace Database\Factories;

use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;
use Faker\Generator;

/**
 * UsuarioFactory - Factory para generar datos de prueba de usuarios
 *
 * Genera instancias fake de usuarios con datos realistas para pruebas,
 * seeders y testing. Cada usuario creado tendrá:
 * - Nick único de usuario
 * - Nombre completo
 * - Email verificado único
 * - Ubicación geográfica aleatoria
 * - Avatar imagen fake
 * - Rol aleatorio (dj, productor, usuario)
 * - Password hasheada ('password')
 * - Token de recuerdo
 *
 * Uso en tests:
 * - Usuario::factory()->create() - Crea 1 usuario
 * - Usuario::factory()->count(5)->create() - Crea 5 usuarios
 * - Usuario::factory()->create(['nick' => 'custom_nick']) - Sobrescribe campos
 *
 * @extends Factory<Usuario>
 */
class UsuarioFactory extends Factory
{
    /**
     * El nombre del modelo que corresponde a esta factory.
     */
    protected $model = Usuario::class;

    /**
     * Define el estado predeterminado del modelo Usuario.
     *
     * Genera atributos aleatorios usando Faker para poblar un registro
     * de usuario con datos realistas pero ficticios.
     *
     * Atributos generados:
     * - nick: nombre de usuario único generado por Faker
     * - nombre: nombre completo de persona
     * - email: correo electrónico único y seguro
     * - ubicacion: nombre de ciudad aleatoria
     * - avatar: URL de imagen de perfil fake
     * - rol: uno de [dj, productor, usuario]
     * - password: hasheada con bcrypt
     * - email_verified_at: marca como verificado
     * - remember_token: token para "recordarme"
     *
     * @return array<string, mixed> Atributos del usuario
     */
    public function definition(): array
    {
        $faker = resolve(Generator::class);
        return [
            'nick' => $faker->unique()->userName(),
            'nombre' => $faker->name(),
            'email' => $faker->unique()->safeEmail(),
            'ubicacion' => $faker->city(),
            'latitud' => $faker->latitude(),
            'longitud' => $faker->longitude(),
            'avatar' => null,
            'rol' => $faker->randomElement(['dj', 'productor', 'usuario']),
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
            'remember_token' => \Illuminate\Support\Str::random(10),
        ];
    }

    /**
     * Crea un usuario basado en un perfil de productor realista.
     *
     * Asigna datos del persona al usuario para crear perfiles coherentes
     * con características musicales y de ubicación realistas.
     *
     * @param array $persona Datos del productor desde ProducerPersonas
     * @return $this Factory state
     */
    public function withPersona($persona): static
    {
        return $this->state(function (array $attributes) use ($persona) {
            return [
                'nick' => $persona['nick'],
                'nombre' => $persona['nombre'],
                'email' => $persona['email'],
                'ubicacion' => $persona['ubicacion'],
                'latitud' => $persona['latitud'],
                'longitud' => $persona['longitud'],
                'rol' => $persona['rol'],
                'biografia' => $persona['biografia'] ?? null,
                'twitter' => $persona['twitter'] ?? null,
                'instagram' => $persona['instagram'] ?? null,
                'avatar' => null,
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'remember_token' => \Illuminate\Support\Str::random(10),
            ];
        });
    }
}
