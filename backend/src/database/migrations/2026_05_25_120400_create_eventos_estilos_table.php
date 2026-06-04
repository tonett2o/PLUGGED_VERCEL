<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eventos_estilos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_evento')->constrained('eventos')->onDelete('cascade');
            $table->foreignId('id_estilo')->constrained('estilos')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['id_evento', 'id_estilo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eventos_estilos');
    }
};
