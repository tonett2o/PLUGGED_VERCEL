<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * CreateMainTables - Migración para crear las tablas principales
 *
 * Crea las 7 tablas base del sistema:
 * 1. usuarios - Usuarios de la plataforma con autenticación
 * 2. colecciones - Álbumes, EPs y recopilaciones
 * 3. playlists - Listas de reproducción personalizadas
 * 4. canciones - Tracks/canciones musicales
 * 5. software - Catálogo de aplicaciones (DAWs, plugins)
 * 6. hardware - Catálogo de equipamiento físico
 * 7. eventos - Eventos musicales (conciertos, festivales)
 *
 * Relaciones:
 * - Usuarios → Colecciones (1:N)
 * - Usuarios → Playlists (1:N)
 * - Usuarios → Canciones (1:N)
 * - Colecciones → Canciones (1:N)
 * - Eventos → Usuarios (N:M - mediante usuarios_eventos)
 * - Software/Hardware → Usuarios (N:M - mediante tablas pivote)
 */
return new class extends Migration
{
    /**
     * Ejecuta las migraciones.
     *
     * Crea las 7 tablas principales con sus índices y relaciones de clave foránea.
     * Se ejecuta con: php artisan migrate
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('nick')->unique();
            $table->string('nombre')->nullable();
            $table->string('email')->unique();
            $table->string('ubicacion')->nullable();
            $table->string('avatar')->nullable();
            $table->enum('rol', ['dj', 'productor', 'admin', 'usuario']);
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('colecciones', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->string('artista');
            $table->string('portada')->nullable();
            $table->string('descripcion')->nullable();
            $table->enum('privacidad', ['publica', 'privada']);
            $table->enum('tipo', ['album', 'ep', 'singles']);
            $table->year('fecha_publicacion');

            $table->foreignId('id_usuario')->constrained('usuarios')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('playlists', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->string('artista');
            $table->string('portada')->nullable();
            $table->string('descripcion')->nullable();
            $table->enum('privacidad', ['publica', 'privada']);
            $table->year('fecha_publicacion');

            $table->foreignId('id_usuario')->constrained('usuarios')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('canciones', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->integer('bpm');
            $table->string('tonalidad');
            $table->string('ubicacion');
            $table->string('portada')->nullable();
            $table->year('fecha_publicacion');

            $table->foreignId('id_usuario')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('id_coleccion')->constrained('colecciones')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('software', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->unique();
            $table->string('version');
            $table->string('distribuidor');
            $table->decimal('precio', 8, 2)->default(0.00);
            $table->string('imagen')->nullable();
            $table->enum('tipo_pago', ['unico', 'mensual', 'anual', 'gratuito']);
            $table->string('descripcion')->nullable();
            $table->timestamps();
        });

        Schema::create('hardware', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->unique();
            $table->string('marca');
            $table->decimal('precio', 8, 2)->default(0.00);
            $table->string('imagen')->nullable();
            $table->string('descripcion')->nullable();
            $table->timestamps();
        });

        Schema::create('eventos', function (Blueprint $table) {
            $table->id();
            $table->string('url_venta')->unique();
            $table->string('nombre');
            $table->string('nombre_sala');
            $table->string('ubicacion');
            $table->string('imagen')->nullable();
            $table->year('fecha_evento');
            $table->timestamps();
        });
    }

    /**
     * Revierte la migración.
     *
     * Elimina todas las tablas creadas en orden inverso
     * para respetarintegridad de claves foráneas.
     *
     * Se ejecuta con: php artisan migrate:rollback
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('eventos');
        Schema::dropIfExists('hardware');
        Schema::dropIfExists('software');
        Schema::dropIfExists('canciones');
        Schema::dropIfExists('playlists');
        Schema::dropIfExists('colecciones');
        Schema::dropIfExists('usuarios');
    }
};