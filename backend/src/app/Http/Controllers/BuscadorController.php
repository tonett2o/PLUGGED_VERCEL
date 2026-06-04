<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Cancion;
use App\Models\Coleccion;
use App\Models\Playlist;
use Illuminate\Http\Request;

class BuscadorController extends Controller
{
    /**
     * Busca en usuarios, canciones, colecciones y playlists
     */
    public function buscar(Request $request)
    {
        $query = $request->query('q', '');

        // Validar que el query tenga al menos 2 caracteres
        if (strlen(trim($query)) < 2) {
            return response()->json([
                'usuarios' => [],
                'canciones' => [],
                'colecciones' => [],
                'playlists' => []
            ]);
        }

        $q = trim($query);

        // Buscar usuarios/artistas
        $usuarios = Usuario::where('nick', 'LIKE', "%{$q}%")
            ->orWhere('nombre', 'LIKE', "%{$q}%")
            ->select('id', 'nick', 'nombre', 'avatar', 'rol')
            ->limit(5)
            ->get();

        // Buscar canciones
        $canciones = Cancion::where('titulo', 'LIKE', "%{$q}%")
            ->select('id', 'titulo', 'tonalidad', 'id_usuario')
            ->limit(5)
            ->get();

        // Buscar colecciones
        $colecciones = Coleccion::where('titulo', 'LIKE', "%{$q}%")
            ->select('id', 'titulo', 'tipo', 'id_usuario')
            ->limit(5)
            ->get();

        // Buscar playlists
        $playlists = Playlist::where('titulo', 'LIKE', "%{$q}%")
            ->select('id', 'titulo', 'id_usuario')
            ->limit(5)
            ->get();

        return response()->json([
            'usuarios' => $usuarios,
            'canciones' => $canciones,
            'colecciones' => $colecciones,
            'playlists' => $playlists
        ]);
    }
}
