<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * CreateReproducciones Table - Registra cada reproducción de canciones
 *
 * Tabla para registrar y analizar las escuchas/reproducciones de canciones.
 * Cada fila representa una canción reproducida por un usuario (o anónimamente).
 *
 * Información:
 * - ID único de reproducción
 * - Referencia a canción (con cascading delete)
 * - Referencia a usuario (nullable para escuchas anónimas)
 * - Timestamps (created_at = momento de la escucha)
 *
 * Índices:
 * - id_cancion: para queries rápidas por canción (top reproducciones)
 *
 * Restricciones:
 * - id_cancion: NOT NULL, constrained, cascade delete
 * - id_usuario: NULLABLE (permite reproducciones anónimas), null on delete
 *
 * Casos de uso:
 * - Contar total de reproducciones por canción
 * - Identificar canciones más populares
 * - Analizar patrones de escucha
 * - Calcular estadísticas por período
 * - Ranking de artistas por reproducciones
 */
return new class extends Migration
{
    /**
     * Ejecuta la migración.
     *
     * Crea tabla reproducciones con indices y relaciones de clave foránea.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('reproducciones', function (Blueprint $table) {
            $table->id();
            // Referencia a canción: obligatoria, cascade delete
            $table->foreignId('id_cancion')->constrained('canciones')->onDelete('cascade');
            // Referencia a usuario: opcional (permite reproducciones anónimas)
            $table->foreignId('id_usuario')->nullable()->constrained('usuarios')->nullOnDelete();
            // Timestamps: created_at es el momento de reproducción
            $table->timestamps();

            // Índice para búsquedas por canción (top reproducciones)
            $table->index('id_cancion');
        });
    }

    /**
     * Revierte la migración.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('reproducciones');
    }
};
