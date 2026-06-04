<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Http\Requests\UsuarioRequest;
use App\Http\Requests\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

/**
 * AuthController - Autenticación y autorización de usuarios
 *
 * Controla las operaciones de autenticación incluyendo:
 * - Registro de nuevos usuarios
 * - Creación automática de colecciones y playlists protegidas al registrarse
 * - Encriptación de contraseñas (bcrypt)
 * - Procesamiento de avatar y banner
 * - Inicio de sesión (login) con validación de credenciales
 * - Generación de tokens de autenticación (Laravel Sanctum)
 * - Cierre de sesión (logout) y revocación de tokens
 * - Manejo de errores de validación y autenticación
 *
 * @package App\Http\Controllers
 */
class AuthController extends Controller
{
    /**
     * Registra un nuevo usuario en el sistema
     *
     * Proceso:
     * 1. Valida datos usando UsuarioRequest (nick, email, nombre, password, ubicación, etc.)
     * 2. Encripta la contraseña usando bcrypt (Hash::make)
     * 3. Procesa avatar:
     *    - Si se proporciona, almacena en storage/public/avatars/
     *    - Si no, asigna avatar por defecto
     * 4. Procesa banner si se proporciona, lo almacena en storage/public/banners/
     * 5. Crea registro de usuario en tabla usuarios
     * 6. Crea automáticamente colección protegida "Singles" (pública)
     * 7. Crea automáticamente playlist protegida "Me gusta" (privada)
     * 8. Genera token de autenticación (Laravel Sanctum)
     * 9. Retorna usuario creado con token de acceso
     *
     * @param UsuarioRequest $request Datos validados: nick, email, nombre, password, ubicacion, avatar, banner
     * @return \Illuminate\Http\JsonResponse Token de acceso y datos del usuario creado
     *
     * @example
     * POST /api/auth/register
     * Body (FormData): {
     *   nick: "nuevo_dj",
     *   email: "nuevouser@example.com",
     *   nombre: "Nuevo Usuario",
     *   password: "SecurePass123",
     *   ubicacion: "Madrid, Spain",
     *   avatar: <File.jpg>,
     *   banner: <File.jpg>
     * }
     * Response: {
     *   access_token: "eyJhbGciOiJIUzI1NiIs...",
     *   token_type: "Bearer",
     *   usuario: {
     *     id: 1,
     *     nick: "nuevo_dj",
     *     email: "nuevouser@example.com",
     *     nombre: "Nuevo Usuario",
     *     avatar: "avatars/...",
     *     banner: "banners/...",
     *     created_at: "2026-05-27T10:30:00Z"
     *   }
     * }
     */
    public function register(UsuarioRequest $request)
    {
        // Paso 1: Obtener datos validados
        $data = $request->validated();

        // Paso 2: Encriptar contraseña
        $data['password'] = Hash::make($data['password']);

        // Paso 3: Procesar avatar (con default si no existe)
        if ($request->hasFile('avatar')) {
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        } else {
            $data['avatar'] = 'default_avatar.png';
        }

        // Paso 4: Procesar banner si existe
        if ($request->hasFile('banner')) {
            $data['banner'] = $request->file('banner')->store('banners', 'public');
        }

        // Paso 5: Crear usuario en base de datos
        $usuario = Usuario::create($data);

        // Paso 6: Crear colección protegida "Singles" automáticamente
        try {
            $usuario->colecciones()->create([
                'titulo' => 'Singles',
                'artista' => $usuario->nick,
                'tipo' => 'singles',
                'privacidad' => 'publica',
                'fecha_publicacion' => date('Y'),
                'portada' => 'portadas/portada-default.jpg',
                'protegida' => true,
            ]);
        } catch (\Exception $e) {
            Log::error('Fallo creando colección Singles: ' . $e->getMessage());
        }

        // Paso 7: Crear playlist protegida "Me gusta" automáticamente
        try {
            $usuario->playlists()->create([
                'titulo' => 'Me gusta',
                'artista' => $usuario->nick,
                'privacidad' => 'privada', // Solo el usuario la ve
                'fecha_publicacion' => date('Y'),
                'portada' => 'portadas/portada-default.jpg',
                'descripcion' => 'Mis canciones favoritas',
                'protegida' => true,
            ]);
        } catch (\Exception $e) {
            Log::error('Fallo creando playlist Me gusta: ' . $e->getMessage());
        }

        // Paso 8: Generar token de autenticación
        $token = $usuario->createToken('auth_token')->plainTextToken;

        // Paso 9: Retornar token y usuario creado
        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'usuario' => $usuario // Objeto usuario completo
        ], 201);
    }

    /**
     * Autentica un usuario existente y genera un token de acceso
     *
     * Proceso:
     * 1. Valida que se proporcionen email y contraseña
     * 2. Busca usuario por email en base de datos
     * 3. Verifica que usuario existe y contraseña coincide (comparación hash)
     * 4. Si credenciales son inválidas, lanza excepción de validación
     * 5. Si credenciales son válidas, genera token de autenticación
     * 6. Retorna token y datos básicos del usuario
     *
     * @param Request $request Debe contener: email (requerido), password (requerido)
     * @return \Illuminate\Http\JsonResponse Token de acceso e información del usuario
     * @throws \Illuminate\Validation\ValidationException Si email o contraseña son incorrectos
     *
     * @example
     * POST /api/auth/login
     * Body: {
     *   email: "usuario@example.com",
     *   password: "SecurePass123"
     * }
     * Response: {
     *   access_token: "eyJhbGciOiJIUzI1NiIs...",
     *   token_type: "Bearer",
     *   usuario: {
     *     id: 1,
     *     nick: "nuevo_dj",
     *     avatar: "avatars/..."
     *   }
     * }
     *
     * @example
     * POST /api/auth/login (credenciales incorrectas)
     * Response: {
     *   error: "Las credenciales son incorrectas."
     * } (422 Unprocessable Entity)
     */
    public function login(LoginRequest $request)
    {
        // Paso 1: Datos validados automáticamente por LoginRequest
        $validated = $request->validated();

        // Paso 2: Buscar usuario por email
        $usuario = Usuario::where('email', $validated['email'])->first();

        // Paso 3: Verificar que usuario existe y contraseña es correcta
        if (!$usuario || !Hash::check($validated['password'], $usuario->password)) {
            // Retornar error de credenciales en formato consistente
            return response()->json([
                'error' => true,
                'message' => 'Credenciales incorrectas',
                'detalles' => [
                    'email' => ['Las credenciales (email o contraseña) son incorrectas.']
                ]
            ], 401);
        }

        // Paso 4: Generar token de autenticación
        $token = $usuario->createToken('auth_token')->plainTextToken;

        // Paso 5: Retornar token e información del usuario
        return response()->json([
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'usuario' => [
                'id'     => $usuario->id,
                'nick'   => $usuario->nick,
                'avatar' => $usuario->avatar
            ]
        ], 200);
    }

    /**
     * Cierra la sesión del usuario revocando su token actual
     *
     * Proceso:
     * 1. Obtiene usuario autenticado desde el token actual
     * 2. Revoca (elimina) el token de acceso actual
     * 3. Retorna mensaje de confirmación
     *
     * El token se invalida inmediatamente y no puede reutilizarse para
     * futuras solicitudes autenticadas.
     *
     * @param Request $request Requiere usuario autenticado (Bearer token)
     * @return \Illuminate\Http\JsonResponse Mensaje de confirmación
     *
     * @example
     * POST /api/auth/logout
     * Headers: Authorization: Bearer {token}
     * Response: { message: "Sesión cerrada" }
     *
     * Nota: Después del logout, el token es inválido y el usuario debe
     * hacer login nuevamente para obtener un nuevo token.
     */
    public function logout(Request $request)
    {
        // Revocar el token actual del usuario autenticado
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada'], 200);
    }
}
