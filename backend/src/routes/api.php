<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CancionController;
use App\Http\Controllers\ColeccionController;
use App\Http\Controllers\EventoController;
use App\Http\Controllers\HardwareController;
use App\Http\Controllers\PlaylistController;
use App\Http\Controllers\SoftwareController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\ComentarioController;
use App\Http\Controllers\ReproduccionController;
use App\Http\Controllers\GaleriaController;
use App\Http\Controllers\UbicacionController;
use App\Http\Controllers\BuscadorController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

/*
|--------------------------------------------------------------------------
| Rutas Públicas (Sin Token)
|--------------------------------------------------------------------------
*/
Route::get('/audios/{filename}', function ($filename) {
    // Apuntamos directamente a la carpeta audios dentro del disco 'public'
    $path = 'audios/' . $filename;

    // Comprobamos si existe en storage/app/public/audios/
    if (!Storage::disk('public')->exists($path)) {
        // Si falla, te devuelvo un mensaje exacto de dónde busqué para que lo veas
        return response('No encontré el audio. Lo busqué exactamente en: ' . Storage::disk('public')->path($path), 404);
    }

    // Si lo encuentra, lo devuelve
    $file = Storage::disk('public')->path($path);
    return response()->file($file);
});


Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// USUARIOS: Registro público, Listado y Detalle (Necesarios para tu componente Mostrar)
Route::post('/usuarios', [UsuarioController::class, 'store']);
Route::get('/usuarios', [UsuarioController::class, 'index']);
// Ranking de oyentes: DEBE ir antes de /usuarios/{usuario} para que no lo capture como id
Route::get('/usuarios/top-oyentes', [UsuarioController::class, 'topOyentes']);
// Amigos de un usuario específico: ruta alternativa para evitar conflictos
Route::get('/usuarios/{id}/amigos', [UsuarioController::class, 'amigosDelUsuario']);
Route::get('/usuarios/{usuario}', [UsuarioController::class, 'show']);

// CANCIONES: Listado y Detalle públicos
Route::get('/canciones', [CancionController::class, 'index']);
Route::get('/canciones/{cancion}', [CancionController::class, 'show']);

// REPRODUCCIONES: registrar una escucha (pública; si hay token se atribuye al usuario)
Route::post('/canciones/{cancion}/reproducir', [ReproduccionController::class, 'store']);

// COMENTARIOS: listado público por canción (cualquiera puede leer los comentarios)
Route::get('/canciones/{cancion}/comentarios', [ComentarioController::class, 'index']);

// COLECCIONES: Listado y Detalle públicos
Route::get('/colecciones', [ColeccionController::class, 'index']);
Route::get('/colecciones/top-colecciones', [ColeccionController::class, 'topColecciones']);
Route::get('/colecciones/{coleccion}', [ColeccionController::class, 'show']);

// EVENTOS: Listado y Detalle públicos
Route::get('/eventos', [EventoController::class, 'index']);
Route::get('/eventos/{evento}', [EventoController::class, 'show']);

// HARDWARE Y SOFTWARE: Listado y Detalle públicos
Route::get('/hardware', [HardwareController::class, 'index']);
Route::get('/hardware/top-hardware', [HardwareController::class, 'topHardware']);
Route::get('/hardware/{hardware}', [HardwareController::class, 'show']);
Route::get('/software', [SoftwareController::class, 'index']);
Route::get('/software/top-software', [SoftwareController::class, 'topSoftware']);
Route::get('/software/{software}', [SoftwareController::class, 'show']);

// PLAYLISTS: Listado y Detalle públicos
Route::get('/playlists', [PlaylistController::class, 'index']);
Route::get('/playlists/{playlist}', [PlaylistController::class, 'show']);

// ESTILOS: Listado público (para seleccionar en eventos, canciones, etc)
Route::get('/estilos', function () {
    $estilos = \App\Models\Estilo::select('id', 'nombre', 'color')->get();
    return response()->json($estilos, 200);
});

// UBICACIONES: Búsqueda pública de ubicaciones (sin token)
Route::get('/ubicaciones/buscar', [UbicacionController::class, 'buscar']);

// BÚSQUEDA: Búsqueda global en artistas, canciones, colecciones y playlists
Route::get('/buscar', [BuscadorController::class, 'buscar']);


/*
|--------------------------------------------------------------------------
| Rutas Protegidas (Requieren Token de Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // Perfil del usuario autenticado
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    // Amigos del usuario autenticado
    Route::get('/usuarios/amigos/lista', [UsuarioController::class, 'amigos']);

    // Gestión de Usuarios (Actualizar y Borrar)
    Route::apiResource('usuarios', UsuarioController::class)
        ->parameters(['usuarios' => 'usuario'])
        ->only(['update', 'destroy']); 

    
    Route::post('/playlists/{playlist}/agregar-cancion', [PlaylistController::class, 'agregarCancion']);
    Route::post('/colecciones/{coleccion}/agregar-cancion', [ColeccionController::class, 'agregarCancion']);
    Route::post('/usuarios/equipamiento', [UsuarioController::class, 'actualizarEquipamiento']);

    // Galería de imágenes del usuario
    Route::post('/usuarios/galeria', [GaleriaController::class, 'store']);
    Route::delete('/usuarios/galeria/{imagen}', [GaleriaController::class, 'destroy']);
    Route::post('/usuarios/{id}/follow', [FollowController::class, 'toggleFollow']);

    // Likes en canciones (toggle)
    Route::post('/canciones/{cancion}/like', [LikeController::class, 'toggle']);

    // Comentarios en canciones
    Route::post('/canciones/{cancion}/comentarios', [ComentarioController::class, 'store']);
    Route::delete('/comentarios/{comentario}', [ComentarioController::class, 'destroy']);

    // Colaboradores en canciones
    Route::get('/canciones/{cancion}/colaboradores', [CancionController::class, 'colaboradores']);
    Route::post('/canciones/{cancion}/colaboradores/{usuario}', [CancionController::class, 'agregarColaborador']);
    Route::delete('/canciones/{cancion}/colaboradores/{usuario}', [CancionController::class, 'removerColaborador']);

    // Colaboradores en colecciones
    Route::get('/colecciones/{coleccion}/colaboradores', [ColeccionController::class, 'colaboradores']);
    Route::post('/colecciones/{coleccion}/colaboradores/{usuario}', [ColeccionController::class, 'agregarColaborador']);
    Route::delete('/colecciones/{coleccion}/colaboradores/{usuario}', [ColeccionController::class, 'removerColaborador']);

    // Colaboradores en eventos
    Route::get('/eventos/{evento}/colaboradores', [EventoController::class, 'colaboradores']);
    Route::post('/eventos/{evento}/colaboradores/{usuario}', [EventoController::class, 'agregarColaborador']);
    Route::delete('/eventos/{evento}/colaboradores/{usuario}', [EventoController::class, 'removerColaborador']);

    // Gestión de Recursos (Solo para Crear, Editar y Borrar)
    Route::apiResource('canciones', CancionController::class)->except(['index', 'show']);
    Route::apiResource('colecciones', ColeccionController::class)->except(['index', 'show']);
    Route::apiResource('eventos', EventoController::class)->except(['index', 'show']);
    Route::apiResource('hardware', HardwareController::class)->except(['index', 'show']);
    Route::apiResource('software', SoftwareController::class)->except(['index', 'show']);
    Route::apiResource('playlists', PlaylistController::class)->except(['index', 'show']);
    
});