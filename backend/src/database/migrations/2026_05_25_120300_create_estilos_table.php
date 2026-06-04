<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * CreateEstilos Table - Lista maestra de géneros musicales
 *
 * Tabla que define los géneros/estilos musicales disponibles en la plataforma.
 * Actúa como catálogo maestro para asociar con eventos (N:M mediante eventos_estilos).
 *
 * Información por género:
 * - Nombre único (ej: "House", "Techno", "Deep House")
 * - Color hexadecimal de 7 caracteres para visualización en mapas/UI
 *
 * Soporta 46 géneros de música electrónica:
 * - 8 géneros principales
 * - 38 subgéneros y variaciones
 *
 * Colores seleccionados estratégicamente:
 * - Azules/Cian para House y sus variantes
 * - Rojos/Naranjas para Techno e Industrial
 * - Amarillos/Dorados para Trance
 * - Verdes para Drum & Bass y Jungle
 * - Púrpuras/Rosas para Synthwave y Experimental
 *
 * Casos de uso:
 * - Asociar múltiples estilos con eventos
 * - Mostrar eventos agrupados por género
 * - Filtrar eventos en mapas por género
 * - Código de color visual para eventos
 */
return new class extends Migration
{
    /**
     * Ejecuta la migración.
     *
     * Crea tabla estilos con nombre único e índice sobre color.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('estilos', function (Blueprint $table) {
            $table->id();
            // Nombre único del género (ej: "House", "Techno")
            $table->string('nombre')->unique();
            // Color hexadecimal de 7 caracteres (#RRGGBB)
            $table->string('color', 7)->default('#0ADAF5');
            // Timestamps para auditoría
            $table->timestamps();
        });
    }

    /**
     * Revierte la migración.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('estilos');
    }
};
