<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('usuarios', function (Blueprint $table) {
            // text es mejor para biografías porque permite párrafos largos
            $table->text('biografia')->nullable();
            // string es perfecto para guardar la ruta del archivo (ej: 'banners/imagen.jpg')
            $table->string('banner')->nullable();
        });
    }

    public function down()
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropColumn(['biografia', 'banner']);
        });
    }
};
