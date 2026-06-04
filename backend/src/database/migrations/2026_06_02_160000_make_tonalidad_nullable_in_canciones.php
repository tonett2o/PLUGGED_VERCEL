<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecuta la migración.
     */
    public function up(): void
    {
        Schema::table('canciones', function (Blueprint $table) {
            // Hacer tonalidad nullable ya que es un campo opcional en el formulario
            $table->string('tonalidad')->nullable()->change();
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::table('canciones', function (Blueprint $table) {
            $table->string('tonalidad')->nullable(false)->change();
        });
    }
};
