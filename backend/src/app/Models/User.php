<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * User - Modelo de usuario (Laravel default para notificaciones)
 *
 * Este es el modelo de usuario por defecto de Laravel utilizado para
 * el sistema de notificaciones. No se utiliza directamente para
 * autenticación en esta aplicación, que usa el modelo Usuario.
 *
 * Este modelo se mantiene para compatibilidad con el sistema de
 * notificaciones de Laravel y puede utilizarse para futuras
 * integraciones de envío de correos o notificaciones por email.
 *
 * Atributos:
 * - name: Nombre del usuario
 * - email: Correo electrónico
 * - password: Contraseña hasheada
 * - remember_token: Token para "recordarme" en login
 * - email_verified_at: Timestamp de verificación de email
 *
 * @package App\Models
 *
 * @property int $id
 * @property string $name Nombre del usuario
 * @property string $email Correo electrónico único
 * @property \Carbon\Carbon|null $email_verified_at Timestamp de verificación
 * @property string $password Contraseña hasheada
 * @property string|null $remember_token Token para persistencia de sesión
 * @property \Carbon\Carbon $created_at Timestamp de creación
 * @property \Carbon\Carbon $updated_at Timestamp de última actualización
 */
#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
