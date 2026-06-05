/**
 * useFollow.js - Hook para seguir y dejar de seguir usuarios
 *
 * Expone la funcion toggleFollow que llama al endpoint POST /api/usuarios/:id/follow.
 * El backend decide si crear o eliminar la relacion de seguimiento segun si ya existe.
 *
 * Gestiona internamente los estados de carga y error para que el componente
 * que lo use pueda deshabilitar botones o mostrar feedback mientras opera.
 *
 * @returns {{ toggleFollow, loading, error }}
 *   toggleFollow(idUsuario) - Alterna el estado de seguimiento del usuario indicado
 *   loading                 - true mientras la peticion esta en curso
 *   error                   - Mensaje de error si la peticion falla, null en caso contrario
 */
import API_URL from '../../config/api.js'
import { useState } from 'react';

export const useFollow = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Alterna el seguimiento del usuario con el id indicado.
     * Si el usuario autenticado ya le sigue, lo deja de seguir y viceversa.
     *
     * @param {number} idUsuario - ID del usuario a seguir/dejar de seguir
     * @returns {object|null} Respuesta del backend o null si hubo error
     */
    const toggleFollow = async (idUsuario) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/usuarios/${idUsuario}/follow`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Error al alternar seguimiento');
            const data = await response.json();
            setLoading(false);
            return data;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            return null;
        }
    };

    return { toggleFollow, loading, error };
};
