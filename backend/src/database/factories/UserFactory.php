<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * UserFactory - Factory para generar datos de prueba de usuarios Laravel
 *
 * Factory para el modelo User (usuario por defecto de Laravel).
 * Se utiliza principalmente para pruebas y seeders donde se requiere
 * generar usuarios con datos realistas pero ficticios.
 *
 * NOTA: Este modelo se mantiene para compatibilidad con el sistema
 * de notificaciones de Laravel. El modelo principal de usuarios es Usuario.php
 *
 * Características:
 * - Email único y verificado
 * - Password hasheada (por defecto: 'password')
 * - Remember token para persistencia de sesión
 * - Método unverified() para generar usuarios sin verificar
 * - Password cachado para eficiencia (mismo hash para múltiples usuarios)
 *
 * Uso en tests:
 * - User::factory()->create() - Crea usuario verificado
 * - User::factory()->unverified()->create() - Usuario sin verificar
 * - User::factory()->count(5)->create() - Crea 5 usuarios
 * - User::factory()->create(['name' => 'Custom Name']) - Sobrescribe campos
 *
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * El nombre del modelo que corresponde a esta factory.
     */
    protected $model = User::class;
    /**
     * The current password being used by the factory.
     *
     * Se cachea la contraseña hasheada para mejorar el rendimiento
     * al crear múltiples usuarios con la misma contraseña.
     */
    protected static ?string $password;

    /**
     * Define el estado predeterminado del modelo User.
     *
     * Genera atributos aleatorios usando Faker para poblar un registro
     * de usuario con datos realistas pero ficticios.
     *
     * Atributos generados:
     * - name: nombre completo de persona
     * - email: correo electrónico único y seguro
     * - email_verified_at: timestamp actual (usuario verificado por defecto)
     * - password: 'password' hasheada con Hash::make() (cachada para eficiencia)
     * - remember_token: token aleatorio de 10 caracteres para persistencia
     *
     * El password se cachea en static::$password para mejorar rendimiento
     * cuando se crean múltiples usuarios en tests/seeders.
     *
     * @return array<string, mixed> Atributos del usuario
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indica que la dirección de correo del usuario no está verificada.
     *
     * Útil para tests donde se necesita un usuario registrado pero sin
     * verificar su email. Sobrescribe email_verified_at a null.
     *
     * Uso:
     * - User::factory()->unverified()->create()
     * - User::factory()->unverified()->count(3)->create()
     *
     * @return static Factory con email sin verificar
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
