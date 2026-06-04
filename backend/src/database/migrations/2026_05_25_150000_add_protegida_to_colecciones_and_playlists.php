<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('colecciones', function (Blueprint $table) {
            $table->boolean('protegida')->default(false)->after('privacidad');
        });

        Schema::table('playlists', function (Blueprint $table) {
            $table->boolean('protegida')->default(false)->after('privacidad');
        });
    }

    public function down(): void
    {
        Schema::table('colecciones', function (Blueprint $table) {
            $table->dropColumn('protegida');
        });

        Schema::table('playlists', function (Blueprint $table) {
            $table->dropColumn('protegida');
        });
    }
};
