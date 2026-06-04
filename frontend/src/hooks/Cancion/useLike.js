import API_URL from '../../config/api.js'
import { useState, useEffect } from 'react';

export const useLike = () => {
    const [likes, setLikes] = useState({}); // { cancionId: { liked: true, count: 128 } }

    // Obtener usuario autenticado
    const getUsuarioActual = () => {
        try {
            return JSON.parse(localStorage.getItem('usuario'));
        } catch (e) {
            console.error('Error parseando usuario:', e);
            return null;
        }
    };

    /**
     * Alternar like/unlike de una canción
     * Llama al backend que maneja automáticamente la sincronización con "Me gusta"
     */
    const toggleLike = async (cancionId) => {
        const token = localStorage.getItem('token`);
        const usuario = getUsuarioActual();

        // Si no está logueado, no hacer nada
        if (!token || !usuario) {
            console.warn('Usuario no autenticado - no se puede dar like`);
            return null;
        }

        try {
            // Llamar al endpoint del backend que sincroniza automáticamente con "Me gusta"
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

            // Actualizar estado local con la respuesta del backend
            setLikes(prev => ({
                ...prev,
                [cancionId]: {
                    liked: data.liked,
                    count: data.likes_count
                }
            }));

            console.log(`Like ${data.liked ? 'agregado' : 'removido'}. Total likes: ${data.likes_count}`);

            // Retornar los datos para que el componente pueda usarlos inmediatamente
            return {
                liked: data.liked,
                count: data.likes_count
            };

        } catch (error) {
            console.error('❌ Error al alternar like:', error);
            return null;
        }
    };

    /**
     * Verificar si el usuario ha likeado una canción
     */
    const isLiked = (cancionId) => {
        return likes[cancionId]?.liked || false;
    };

    /**
     * Obtener el total de likes de una canción
     */
    const getLikeCount = (cancionId) => {
        return likes[cancionId]?.count || 0;
    };

    /**
     * Cargar likes del usuario desde el backend
     * (Opcional: si necesitas cargar todos los likes al montar el componente)
     */
    const cargarLikesDelUsuario = async () => {
        const token = localStorage.getItem('token`);
        const usuario = getUsuarioActual();

        if (!token || !usuario) return;

        try {
            // Aquí iría una petición GET para obtener todas las canciones likeadas por el usuario
            // Por ahora, los likes se cargan bajo demanda cuando se interactúa con cada canción
            console.log('Cargando likes del usuario...`);
        } catch (error) {
            console.error('Error cargando likes:', error);
        }
    };

    return {
        toggleLike,
        isLiked,
        getLikeCount,
        cargarLikesDelUsuario
    };
};




