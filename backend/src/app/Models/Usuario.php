<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\DB;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Usuario - Modelo de usuarios del sistema
 *
 * Representa un usuario de la plataforma musical con:
 * - Autenticación: email, password, tokens Sanctum
 * - Perfil: nick, nombre, avatar, banner, biografía, ubicación
 * - Redes sociales: Twitter, Instagram, YouTube, Spotify, TikTok, SoundCloud
 * - Contenido: canciones, colecciones, playlists, galerías
 * - Interacciones: likes, comentarios, seguimientos
 * - Equipamiento: software y hardware que posee
 * - Eventos: participación en eventos musicales
 *
 * @package App\Models
 *
 * @property int $id
 * @property string $nick Nombre único del usuario (seudónimo)
 * @property string $nombre Nombre completo
 * @property string $email Email único para autenticación
 * @property string $password Contraseña encriptada
 * @property string $rol Rol del usuario (user, admin, etc.)
 * @property string|null $avatar Ruta a avatar del usuario
 * @property string|null $banner Ruta a banner del perfil
 * @property string|null $biografia Descripción del usuario
 * @property string|null $ubicacion Ubicación geográfica del usuario
 * @property decimal|null $latitud Latitud de ubicación
 * @property decimal|null $longitud Longitud de ubicación
 * @property string|null $twitter Handle de Twitter
 * @property string|null $instagram Handle de Instagram
 * @property string|null $youtube Canal de YouTube
 * @property string|null $spotify Perfil de Spotify
 * @property string|null $tiktok Handle de TikTok
 * @property string|null $soundcloud Perfil de SoundCloud
 * @property \Carbon\Carbon $created_at Timestamp de registro
 * @property \Carbon\Carbon $updated_at Timestamp de última actualización
 */
class Usuario extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $table = 'usuarios';

    protected $fillable = [
        'nick',
        'nombre',
        'email',
        'ubicacion',
        'latitud',
        'longitud',
        'avatar',
        'rol',
        'password',
        'banner',
        'biografia',
        'twitter',
        'instagram',
        'youtube',
        'spotify',
        'tiktok',
        'soundcloud',
    ];

    protected $casts = [
        'latitud' => 'decimal:8',
        'longitud' => 'decimal:8',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Acceso para obtener la URL completa del avatar del usuario.
     *
     * Convierte la ruta almacenada en storage a una URL pública y accesible.
     * Si no hay avatar, retorna null.
     *
     * @return \Illuminate\Database\Eloquent\Casts\Attribute Atributo con getter
     */
    protected function avatar(): Attribute
    {
        return Attribute::make(
            get: fn($value) => $value ? asset('storage/' . $value) : null,
        );
    }

    /**
     * Acceso para obtener la URL completa del banner del usuario.
     *
     * Convierte la ruta almacenada en storage a una URL pública y accesible.
     * Si no hay banner, retorna null.
     *
     * @return \Illuminate\Database\Eloquent\Casts\Attribute Atributo con getter
     */
    protected function banner(): Attribute
    {
        return Attribute::make(
            get: fn($value) => $value ? asset('storage/' . $value) : null,
        );
    }

    /**
     * Obtiene todas las canciones publicadas por este usuario
     *
     * @return HasMany Relación uno-a-muchos con Cancion
     */
    public function canciones(): HasMany
    {
        return $this->hasMany(Cancion::class, 'id_usuario');
    }

    /**
     * Obtiene la galería de imágenes del usuario (fotos, capturas, etc.)
     *
     * Ordenadas por más recientes primero.
     *
     * @return HasMany Relación uno-a-muchos con ImagenGaleria
     */
    public function galeria(): HasMany
    {
        return $this->hasMany(ImagenGaleria::class, 'id_usuario')->latest();
    }

    /**
     * Obtiene todas las colecciones (álbumes, EPs) publicadas por este usuario
     *
     * @return HasMany Relación uno-a-muchos con Coleccion
     */
    public function colecciones(): HasMany
    {
        return $this->hasMany(Coleccion::class, 'id_usuario');
    }

    /**
     * Obtiene todas las playlists creadas por este usuario
     *
     * @return HasMany Relación uno-a-muchos con Playlist
     */
    public function playlists(): HasMany
    {
        return $this->hasMany(Playlist::class, 'id_usuario');
    }

    /**
     * Obtiene todas las canciones que este usuario ha marcado como favoritas (likes)
     *
     * @return BelongsToMany Relación muchos-a-muchos con Cancion
     */
    public function canciones_liked(): BelongsToMany
    {
        return $this->belongsToMany(
            Cancion::class,
            'likes',         // Tabla pivote
            'id_usuario',    // FK del usuario en pivot
            'id_cancion'     // FK de la canción en pivot
        );
    }

    /**
     * Obtiene todos los comentarios que este usuario ha hecho en canciones
     *
     * Incluye el texto del comentario y el segundo (timestamp) en el que fue hecho.
     *
     * @return BelongsToMany Relación muchos-a-muchos con Cancion (a través de comentarios)
     */
    public function comentarios()
    {
        return $this->belongsToMany(Cancion::class, 'comentarios', 'id_usuario', 'id_cancion')
            ->withPivot('texto', 'segundo')
            ->withTimestamps();
    }

    /**
     * Obtiene los usuarios que este usuario sigue
     *
     * Usuarios a los que yo sigo (relación unidireccional).
     *
     * @return BelongsToMany Relación muchos-a-muchos con Usuario
     */
    public function seguidos(): BelongsToMany
    {
        return $this->belongsToMany(
            Usuario::class,
            'seguidores',    // Tabla pivote
            'id_seguidor',   // FK del usuario que sigue (yo)
            'id_seguido'     // FK del usuario que es seguido
        );
    }

    /**
     * Obtiene los usuarios que siguen a este usuario
     *
     * Usuarios que me siguen a mí (relación inversa).
     *
     * @return BelongsToMany Relación muchos-a-muchos con Usuario
     */
    public function seguidores(): BelongsToMany
    {
        return $this->belongsToMany(
            Usuario::class,
            'seguidores',    // Tabla pivote
            'id_seguido',    // FK del usuario seguido (yo)
            'id_seguidor'    // FK del usuario que sigue
        );
    }

    /**
     * Obtiene todo el software que este usuario utiliza
     *
     * DAWs, plugins, sintetizadores virtuales, etc.
     *
     * @return BelongsToMany Relación muchos-a-muchos con Software
     */
    public function softwares(): BelongsToMany
    {
        return $this->belongsToMany(
            Software::class,
            'usuarios_software',  // Tabla pivote
            'id_usuario',         // FK del usuario
            'id_software'         // FK del software
        )->withTimestamps();
    }

    /**
     * Obtiene todo el hardware que este usuario posee
     *
     * Sintetizadores, controladores MIDI, monitores, etc.
     * Incluye cantidad de cada equipo.
     *
     * @return BelongsToMany Relación muchos-a-muchos con Hardware
     */
    public function hardwares(): BelongsToMany
    {
        return $this->belongsToMany(
            Hardware::class,
            'usuarios_hardware',  // Tabla pivote
            'id_usuario',         // FK del usuario
            'id_hardware'         // FK del hardware
        )
            ->withPivot('cantidad')  // Incluir cantidad en pivot
            ->withTimestamps();
    }

    /**
     * Obtiene los eventos a los que este usuario asiste/participa
     *
     * @return BelongsToMany Relación muchos-a-muchos con Evento
     */
    public function eventos(): BelongsToMany
    {
        return $this->belongsToMany(
            Evento::class,
            'usuarios_eventos',   // Tabla pivote
            'id_usuario',         // FK del usuario
            'id_evento'           // FK del evento
        )->withTimestamps();
    }

    /**
     * Obtiene los eventos en los que este usuario es colaborador
     *
     * @return BelongsToMany Relación muchos-a-muchos con Evento
     */
    public function eventos_colaborando(): BelongsToMany
    {
        return $this->belongsToMany(
            Evento::class,
            'evento_colaboradores',  // Tabla pivote
            'id_usuario',            // FK del usuario colaborador
            'id_evento'              // FK del evento
        )->withTimestamps();
    }

    /**
     * Obtiene los eventos que este usuario crea/organiza
     *
     * @return HasMany Relación uno-a-muchos con Evento (como creador)
     */
    public function eventosCreados(): HasMany
    {
        return $this->hasMany(Evento::class, 'id_usuario', 'id');
    }

    /**
     * Obtiene los géneros/estilos musicales primarios de este usuario
     *
     * Estilos que este productor o DJ principalmente produce/toca
     *
     * @return BelongsToMany Relación muchos-a-muchos con Estilo
     */
    public function estilos(): BelongsToMany
    {
        return $this->belongsToMany(
            Estilo::class,
            'usuarios_estilos',      // Tabla pivote
            'id_usuario',            // FK del usuario
            'id_estilo'              // FK del estilo
        )->withTimestamps();
    }

    /**
     * Obtiene los amigos del usuario (usuarios que se siguen mutuamente)
     *
     * Un amigo es un usuario con el que existe relación bidireccional:
     * tanto yo lo sigo como él me sigue.
     *
     * @return \Illuminate\Database\Eloquent\Collection Colección de usuarios amigos
     */
    public function amigos()
    {
        $usuarioActualId = $this->id;

        // Paso 1: Encontrar los usuarios que yo sigo
        $misSeguidoIds = DB::table('seguidores')
            ->where('id_seguidor', $usuarioActualId)
            ->pluck('id_seguido')
            ->toArray();

        // Paso 2: Si no sigo a nadie, retornar colección vacía
        if (empty($misSeguidoIds)) {
            return Usuario::whereIn('id', [])->get();
        }

        // Paso 3: De esos usuarios, encontrar los que también me siguen a mí
        // (intersección de mi lista de seguidos con mis seguidores)
        $amigosIds = DB::table('seguidores')
            ->whereIn('id_seguidor', $misSeguidoIds)  // Usuarios que yo sigo
            ->where('id_seguido', $usuarioActualId)   // Que también me siguen
            ->pluck('id_seguidor')
            ->toArray();

        // Paso 4: Retornar los amigos con sus datos básicos
        return Usuario::whereIn('id', $amigosIds)
            ->select('id', 'nick', 'nombre', 'avatar', 'biografia')
            ->get();
    }
}
