/**
 * useComentarios.js - Hook de comentarios de canciones contra el backend
 *
 * Gestiona los comentarios de una cancion haciendo peticiones reales a la API.
 * Los comentarios son visibles para todos los usuarios porque se persisten en
 * la base de datos, no en localStorage.
 *
 * El backend devuelve los campos en formato plano (usuario_nick, usuario_avatar, segundo).
 * Este hook los normaliza al formato que usa DetallesCancion (usuario.nombre, tiempoSegundos, etc.)
 *
 * Operaciones:
 *   cargarComentarios(cancionId)              - GET   /api/canciones/:id/comentarios
 *   agregarComentario(cancionId, texto, seg)  - POST  /api/canciones/:id/comentarios
 *   eliminarComentario(cancionId, comentId)   - DELETE /api/comentarios/:id
 *   obtenerComentarios(cancionId)             - Lectura del estado local (sincrona)
 */
import API_URL from '../../config/api.js';
import { useState } from 'react';
import { useAuth } from '../../contexts/ProveedorAuth';

/**
 * Convierte un comentario del formato del backend al formato que usa el componente.
 * Backend: { id, texto, segundo, created_at, id_usuario, usuario_nick, usuario_avatar }
 * Frontend: { id, texto, tiempoSegundos, timestamp, fechaCreacion, usuario: { id, nombre, avatar } }
 */
const normalizarComentario = (c) => {
    const segundo = c.segundo || 0;
    const minutos = Math.floor(segundo / 60);
    const segs = Math.floor(segundo % 60);
    return {
        id: c.id,
        texto: c.texto,
        tiempoSegundos: segundo,
        timestamp: `${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`,
        fechaCreacion: c.created_at,
        usuario: {
            id: c.id_usuario,
            nombre: c.usuario_nick || 'Usuario',
            avatar: c.usuario_avatar || null
        }
    };
};

export const useComentarios = () => {
    const { usuario } = useAuth();

    // Mapa de comentarios por cancion: { [cancionId]: Array<comentario normalizado> }
    const [comentariosPorCancion, setComentariosPorCancion] = useState({});
    const [cargando, setCargando] = useState(false);

    /**
     * Carga los comentarios de una cancion desde el backend.
     * Publica, no requiere autenticacion.
     * Debe llamarse desde un useEffect cuando el id de cancion cambia.
     *
     * @param {number} cancionId - ID de la cancion
     */
    const cargarComentarios = async (cancionId) => {
        if (!cancionId) return;
        setCargando(true);
        try {
            const response = await fetch(`${API_URL}/api/canciones/${cancionId}/comentarios`, {
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                const normalizados = Array.isArray(data) ? data.map(normalizarComentario) : [];
                setComentariosPorCancion(prev => ({ ...prev, [cancionId]: normalizados }));
            }
        } catch (e) {
            console.error('Error cargando comentarios:', e);
        } finally {
            setCargando(false);
        }
    };

    /**
     * Devuelve el array de comentarios de una cancion desde el estado local.
     * Llamada sincrona; el array se puebla mediante cargarComentarios().
     *
     * @param {number} cancionId - ID de la cancion
     * @returns {Array} Array de comentarios normalizados
     */
    const obtenerComentarios = (cancionId) => {
        return comentariosPorCancion[cancionId] || [];
    };

    /**
     * Envia un nuevo comentario al backend y lo anade al estado local.
     * Requiere usuario autenticado.
     *
     * @param {number} cancionId    - ID de la cancion
     * @param {string} texto        - Texto del comentario
     * @param {number} tiempoActual - Segundo de la cancion en el que se ancla el comentario
     * @returns {object|null} Comentario normalizado creado, o null si fallo
     */
    const agregarComentario = async (cancionId, texto, tiempoActual = 0) => {
        if (!texto.trim() || !usuario) return null;
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_URL}/api/canciones/${cancionId}/comentarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    texto: texto.trim(),
                    segundo: Math.floor(tiempoActual)
                })
            });

            if (response.ok) {
                const data = await response.json();
                const nuevo = normalizarComentario(data.comentario);

                // Insertar y reordenar por segundo ascendente (igual que el backend)
                setComentariosPorCancion(prev => {
                    const actuales = prev[cancionId] || [];
                    const actualizados = [...actuales, nuevo]
                        .sort((a, b) => a.tiempoSegundos - b.tiempoSegundos);
                    return { ...prev, [cancionId]: actualizados };
                });

                return nuevo;
            } else {
                const err = await response.json();
                console.error('Error al publicar comentario:', err);
                return null;
            }
        } catch (e) {
            console.error('Error al publicar comentario:', e);
            return null;
        }
    };

    /**
     * Elimina un comentario del backend y lo quita del estado local.
     * El backend verifica que el usuario autenticado sea el autor (403 si no lo es).
     *
     * @param {number} cancionId    - ID de la cancion (para actualizar el estado local)
     * @param {number} comentarioId - ID del comentario a eliminar
     * @returns {boolean} true si se elimino correctamente
     */
    const eliminarComentario = async (cancionId, comentarioId) => {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${API_URL}/api/comentarios/${comentarioId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Eliminar del estado local sin recargar toda la lista
                setComentariosPorCancion(prev => {
                    const actuales = prev[cancionId] || [];
                    return { ...prev, [cancionId]: actuales.filter(c => c.id !== comentarioId) };
                });
                return true;
            }

            // 403: el usuario no es el autor
            console.error('No puedes eliminar ese comentario');
            return false;
        } catch (e) {
            console.error('Error al eliminar comentario:', e);
            return false;
        }
    };

    return {
        cargarComentarios,
        obtenerComentarios,
        agregarComentario,
        eliminarComentario,
        comentariosPorCancion,
        cargando
    };
};
