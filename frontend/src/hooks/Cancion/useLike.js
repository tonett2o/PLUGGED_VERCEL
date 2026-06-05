/**
 * useLike.js - Hook para gestionar likes de canciones
 *
 * Mantiene un mapa local de likes por cancion { cancionId: { liked, count } }
 * que se actualiza con la respuesta del backend tras cada interaccion.
 *
 * El endpoint POST /api/canciones/:id/like actua como toggle: si el usuario
 * ya habia dado like lo elimina, si no lo habia dado lo crea. El backend
 * tambien sincroniza automaticamente la playlist "Me gusta" del usuario.
 *
 * El usuario debe estar autenticado para poder dar like. Si no hay token,
 * toggleLike devuelve null sin hacer la peticion.
 *
 * @returns {{
 *   toggleLike(cancionId),        - Alterna el like de la cancion indicada
 *   isLiked(cancionId),           - Indica si el usuario ha dado like a esa cancion
 *   getLikeCount(cancionId),      - Devuelve el conteo de likes de la cancion
 *   cargarLikesDelUsuario()       - Placeholder para carga inicial (sin implementar)
 * }}
 */
import API_URL from '../../config/api.js'
import { useState } from 'react';

export const useLike = () => {
    // Mapa de likes: { [cancionId]: { liked: boolean, count: number } }
    const [likes, setLikes] = useState({});

    /**
     * Lee el usuario autenticado desde localStorage de forma segura.
     * @returns {object|null} Objeto usuario o null
     */
    const getUsuarioActual = () => {
        try {
            return JSON.parse(localStorage.getItem('usuario'));
        } catch (e) {
            console.error('Error parseando usuario:', e);
            return null;
        }
    };

    /**
     * Alterna el like de una cancion. Si el usuario no esta autenticado,
     * no hace nada y devuelve null.
     *
     * Tras la peticion, actualiza el estado local con los datos frescos
     * del backend (liked + likes_count).
     *
     * @param {number} cancionId - ID de la cancion
     * @returns {{ liked: boolean, count: number }|null}
     */
    const toggleLike = async (cancionId) => {
        const token = localStorage.getItem('token');
        const usuario = getUsuarioActual();

        if (!token || !usuario) {
            console.warn('Usuario no autenticado - no se puede dar like');
            return null;
        }

        try {
            const response = await fetch(`${API_URL}/api/canciones/${cancionId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`Error ${response.status}: No se pudo alternar like`, errorData);
                return null;
            }

            const data = await response.json();

            // Actualizar el estado local con la respuesta del backend
            setLikes(prev => ({
                ...prev,
                [cancionId]: {
                    liked: data.liked,
                    count: data.likes_count
                }
            }));

            return {
                liked: data.liked,
                count: data.likes_count
            };

        } catch (error) {
            console.error('Error al alternar like:', error);
            return null;
        }
    };

    /**
     * Indica si el usuario autenticado ha dado like a la cancion.
     * @param {number} cancionId - ID de la cancion
     * @returns {boolean}
     */
    const isLiked = (cancionId) => {
        return likes[cancionId]?.liked || false;
    };

    /**
     * Devuelve el numero de likes de la cancion segun el estado local.
     * @param {number} cancionId - ID de la cancion
     * @returns {number}
     */
    const getLikeCount = (cancionId) => {
        return likes[cancionId]?.count || 0;
    };

    /**
     * Placeholder para una carga inicial de todos los likes del usuario.
     * Por ahora los likes se cargan bajo demanda al interactuar con cada cancion.
     */
    const cargarLikesDelUsuario = async () => {
        const token = localStorage.getItem('token');
        const usuario = getUsuarioActual();

        if (!token || !usuario) return;

        // Pendiente de implementar: GET /api/usuarios/:id/likes
    };

    return {
        toggleLike,
        isLiked,
        getLikeCount,
        cargarLikesDelUsuario
    };
};
