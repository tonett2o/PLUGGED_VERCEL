import API_URL from '../../config/api.js'
import { useState } from 'react';

export const useFollow = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const toggleFollow = async (idUsuario) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/usuarios/${idUsuario}/follow`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
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




