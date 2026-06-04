<?php
require 'vendor/autoload.php';
require 'src/bootstrap.php';

use App\Models\Usuario;
use App\Models\Evento;

// Usuario 1
$usuario = Usuario::find(1);
if ($usuario) {
    echo "Usuario 1: " . $usuario->nombre . "\n";
    echo "Eventos creados: " . $usuario->eventosCreados()->count() . "\n";
    echo "IDs de eventos creados: ";
    echo json_encode($usuario->eventosCreados()->pluck('id_usuario')->toArray()) . "\n";
    
    echo "\n--- Eventos en BD ---\n";
    $eventos = Evento::select('id', 'nombre', 'id_usuario')->limit(5)->get();
    echo $eventos->toJson(JSON_PRETTY_PRINT) . "\n";
}
