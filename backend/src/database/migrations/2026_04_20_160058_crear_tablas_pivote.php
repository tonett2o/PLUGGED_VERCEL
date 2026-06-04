<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * CreatePivotTables - Migración para crear tablas pivote (many-to-many)
 *
 * Crea 7 tablas pivote para relaciones muchos-a-muchos:
 * 1. cancion_playlist - Canciones en playlists con orden
 * 2. likes - Usuarios que dan like a canciones
 * 3. seguidores - Usuarios que se siguen mutuamente
 * 4. comentarios - Comentarios de usuarios en canciones
 * 5. usuarios_eventos - Participación de usuarios en eventos
 * 6. usuarios_software - Software que utiliza cada usuario
 * 7. usuarios_hardware - Hardware que posee cada usuario (con cantidad)
 *
 * Características especiales:
 * - cancion_playlist: incluye enum 'orden' para ordenamiento personalizado
 * - comentarios: tiene ID propio (no pivote simple) por múltiples comentarios
 * - usuarios_hardware: incluye columna 'cantidad' para múltiples unidades
 * - seguidores: no tiene updated_at (solo created_at)
 * - Todas con cascading deletes para mantener integridad referencial
 */
return new class extends Migration
{
    /**
     * Ejecuta las migraciones.
     *
     * Crea 7 tablas pivote con claves foráneas y restricciones de integridad.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('cancion_playlist', function (Blueprint $table) {
            $table->foreignId('id_cancion')->constrained('canciones')->onDelete('cascade');
            $table->foreignId('id_playlist')->constrained('playlists')->onDelete('cascade');
            $table->enum('orden', ['artistaAZ', 'artistaZA', 'tituloAZ', 'tituloZA', 'fechaAgregadaAsc', 'fechaAgregadaDesc'])->default('fechaAgregadaDesc');
            $table->primary(['id_cancion', 'id_playlist']); 
            $table->timestamps();
        });

        Schema::create('likes', function (Blueprint $table) {
            $table->foreignId('id_usuario')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('id_cancion')->constrained('canciones')->onDelete('cascade');
            $table->primary(['id_usuario', 'id_cancion']);
            $table->timestamps();
        });

        Schema::create('seguidores', function (Blueprint $table) {
            $table->foreignId('id_seguidor')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('id_seguido')->constrained('usuarios')->onDelete('cascade');
            $table->primary(['id_seguidor', 'id_seguido']);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('comentarios', function (Blueprint $table) {
            $table->id(); // Añadido ID propio para permitir varios comentarios del mismo usuario
            $table->foreignId('id_usuario')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('id_cancion')->constrained('canciones')->onDelete('cascade');
            $table->text('texto'); // Cambiado string por text por si escriben mucho
            $table->unsignedInteger('segundo');
            $table->timestamps(); // Recomendado para saber cuándo se comentó
        });

        Schema::create('usuarios_eventos', function (Blueprint $table) {
            $table->foreignId('id_usuario')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('id_evento')->constrained('eventos')->onDelete('cascade');
            $table->primary(['id_usuario', 'id_evento']);
            $table->timestamps();
        });

        Schema::create('usuarios_software', function (Blueprint $table) {
            $table->foreignId('id_usuario')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('id_software')->constrained('software')->onDelete('cascade');
            $table->primary(['id_usuario', 'id_software']);
            $table->timestamps();
        });

        Schema::create('usuarios_hardware', function (Blueprint $table) {
            $table->foreignId('id_usuario')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('id_hardware')->constrained('hardware')->onDelete('cascade');
            $table->unsignedInteger('cantidad')->default(1);
            $table->primary(['id_usuario', 'id_hardware']);
            $table->timestamps();
        });
    }

    /**
     * Revierte la migración.
     *
     * Elimina todas las tablas pivote en orden inverso.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios_hardware');
        Schema::dropIfExists('usuarios_software');
        Schema::dropIfExists('usuarios_eventos');
        Schema::dropIfExists('comentarios');
        Schema::dropIfExists('seguidores');
        Schema::dropIfExists('likes');
        Schema::dropIfExists('cancion_playlist');
    }
};