<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Crea tabla pivote usuarios_estilos
 *
 * Tabla muchos-a-muchos que relaciona usuarios con estilos musicales.
 * Permite que cada usuario (productor/DJ) tenga múltiples géneros primarios.
 *
 * Estructura:
 * - id: primary key auto-incremental
 * - id_usuario: FK a usuarios.id
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
        Schema::create('usuarios_estilos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_usuario');
            $table->unsignedBigInteger('id_estilo');
            $table->timestamps();

            // Relaciones foráneas
            $table->foreign('id_usuario')
                ->references('id')
                ->on('usuarios')
                ->onDelete('cascade');

            $table->foreign('id_estilo')
                ->references('id')
                ->on('estilos')
                ->onDelete('cascade');

            // Índices para queries eficientes
            $table->unique(['id_usuario', 'id_estilo']);
            $table->index('id_usuario');
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
        Schema::dropIfExists('usuarios_estilos');
    }
};
