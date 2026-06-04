<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * CreateEventoColaboradores Table - Colaboradores en eventos
 *
 * Tabla pivote que asocia usuarios colaboradores con eventos.
 * Un evento puede tener múltiples colaboradores (usuarios que ayudan a organizarlo).
 * Un usuario puede colaborar en múltiples eventos.
 *
 * Información:
 * - ID único de registro
 * - Referencia a evento (con cascading delete)
 * - Referencia a usuario colaborador (con cascading delete)
 * - Timestamps (para auditoría de quién colaboró cuándo)
 *
 * Restricciones:
 * - Clave única compuesta (id_evento, id_usuario) para evitar duplicados
 * - Cascading delete en ambas direcciones
 *
 * Diferencia con usuarios_eventos:
 * - usuarios_eventos: participantes/asistentes del evento
 * - evento_colaboradores: personas que colaboran en la organización
 *
 * Casos de uso:
 * - Listar colaboradores de un evento
 * - Ver a qué eventos colabora un usuario
 * - Créditos/agradecimientos del evento
 * - Acceso privilegiado a edición de evento
 */
return new class extends Migration
{
    /**
     * Ejecuta la migración.
     *
     * Crea tabla evento_colaboradores con claves foráneas y restricción única.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('evento_colaboradores', function (Blueprint $table) {
            $table->id();
            // Referencia a evento
            $table->unsignedBigInteger('id_evento');
            // Referencia a usuario colaborador
            $table->unsignedBigInteger('id_usuario');
            // Timestamps para auditoría
            $table->timestamps();

            // Claves foráneas con cascading delete
            $table->foreign('id_evento')->references('id')->on('eventos')->onDelete('cascade');
            $table->foreign('id_usuario')->references('id')->on('usuarios')->onDelete('cascade');

            // Única compuesta para evitar colaboradores duplicados
            $table->unique(['id_evento', 'id_usuario']);
        });
    }

    /**
     * Revierte la migración.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('evento_colaboradores');
    }
};
