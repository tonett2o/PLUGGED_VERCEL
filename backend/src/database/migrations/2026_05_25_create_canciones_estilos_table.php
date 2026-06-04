<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Crea tabla pivote canciones_estilos
 *
 * Tabla muchos-a-muchos que relaciona canciones con géneros/estilos musicales.
 * Permite que cada canción tenga múltiples géneros asociados.
 *
 * Estructura:
 * - id: primary key auto-incremental
 * - id_cancion: FK a canciones.id
 * - id_estilo: FK a estilos.id
 * - created_at, updated_at: timestamps
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('canciones_estilos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_cancion');
            $table->unsignedBigInteger('id_estilo');
            $table->timestamps();

            // Relaciones foráneas
            $table->foreign('id_cancion')
                ->references('id')
                ->on('canciones')
                ->onDelete('cascade');

            $table->foreign('id_estilo')
                ->references('id')
                ->on('estilos')
                ->onDelete('cascade');

            // Índices para queries eficientes
            $table->unique(['id_cancion', 'id_estilo']);
            $table->index('id_cancion');
            $table->index('id_estilo');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('canciones_estilos');
    }
};
