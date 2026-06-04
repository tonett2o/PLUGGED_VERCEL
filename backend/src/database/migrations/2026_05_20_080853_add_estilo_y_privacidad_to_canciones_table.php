<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('canciones', function (Blueprint $table) {
            // Añadimos la columna 'estilo' (si no la tienes)
            $table->string('estilo', 100)->nullable()->after('tonalidad');
            
            // Añadimos la columna 'privacidad' (por si acaso tampoco la tenías en la base de datos)
            // Si ya la tenías creada de antes, borra esta línea para que no de error
            $table->enum('privacidad', ['publica', 'privada'])->default('publica')->after('estilo');
        });
    }

    public function down(): void
    {
        Schema::table('canciones', function (Blueprint $table) {
            // Si deshacemos la migración, borramos las columnas
            $table->dropColumn(['estilo', 'privacidad']);
        });
    }
};
