<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Paso 1: Cambiar de YEAR a VARCHAR temporalmente
        Schema::table('eventos', function (Blueprint $table) {
            $table->string('fecha_evento', 255)->nullable()->change();
        });

        // Paso 2: Actualizar valores YEAR a DATE format (YYYY-01-01)
        DB::statement("UPDATE eventos SET fecha_evento = CONCAT(fecha_evento, '-01-01') WHERE fecha_evento IS NOT NULL AND fecha_evento != ''");

        // Paso 3: Cambiar de VARCHAR a DATE
        Schema::table('eventos', function (Blueprint $table) {
            $table->date('fecha_evento')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('eventos', function (Blueprint $table) {
            $table->year('fecha_evento')->nullable()->change();
        });
    }
};
