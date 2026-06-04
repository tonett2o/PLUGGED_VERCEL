<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('coleccion_colaboradores', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_coleccion');
            $table->unsignedBigInteger('id_usuario');
            $table->timestamps();

            // Foreign keys
            $table->foreign('id_coleccion')->references('id')->on('colecciones')->onDelete('cascade');
            $table->foreign('id_usuario')->references('id')->on('usuarios')->onDelete('cascade');

            // Unique constraint to prevent duplicates
            $table->unique(['id_coleccion', 'id_usuario']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coleccion_colaboradores');
    }
};
