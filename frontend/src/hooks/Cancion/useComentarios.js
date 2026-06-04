import API_URL from '../../config/api.js'
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/ProveedorAuth';

export const useComentarios = () => {
    const { usuario } = useAuth();
    const [comentariosPorCancion, setComentariosPorCancion] = useState({});

    // Cargar comentarios desde localStorage
    useEffect(() => {
        const comentariosGuardados = localStorage.getItem('comentariosMusica');
        if (comentariosGuardados) {
            try {
                setComentariosPorCancion(JSON.parse(comentariosGuardados));
            } catch (e) {
                console.error('Error cargando comentarios:', e);
            }
        }
    }, []);

    // Guardar comentarios en localStorage
    const guardarComentarios = (nuevosComentarios) => {
        setComentariosPorCancion(nuevosComentarios);
        localStorage.setItem('comentariosMusica', JSON.stringify(nuevosComentarios));
    };

    // Agregar comentario
    const agregarComentario = (cancionId, texto, tiempoActual = 0) => {
        if (!texto.trim() || !usuario) return null;

        const nuevosComentarios = { ...comentariosPorCancion };

        if (!nuevosComentarios[cancionId]) {
            nuevosComentarios[cancionId] = [];
        }

        // Formatear tiempo MM:SS
        const minutos = Math.floor(tiempoActual / 60);
        const segundos = Math.floor(tiempoActual % 60);
        const tiempoFormato = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

        const comentario = {
            id: Date.now(),
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre || usuario.nick,
                avatar: usuario.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${usuario.id}`
            },
            texto,
            timestamp: tiempoFormato,
            tiempoSegundos: tiempoActual,
            fechaCreacion: new Date().toISOString(),
            likes: 0
        };

        nuevosComentarios[cancionId] = [comentario, ...nuevosComentarios[cancionId]];
        guardarComentarios(nuevosComentarios);

        return comentario;
    };

    // Obtener comentarios de una canción
    const obtenerComentarios = (cancionId) => {
        return comentariosPorCancion[cancionId] || [];
    };

    // Eliminar comentario
    const eliminarComentario = (cancionId, comentarioId) => {
        const nuevosComentarios = { ...comentariosPorCancion };

        if (nuevosComentarios[cancionId]) {
            nuevosComentarios[cancionId] = nuevosComentarios[cancionId].filter(c => c.id !== comentarioId);

            if (nuevosComentarios[cancionId].length === 0) {
                delete nuevosComentarios[cancionId];
            }

            guardarComentarios(nuevosComentarios);
            return true;
        }

        return false;
    };

    // Editar comentario
    const editarComentario = (cancionId, comentarioId, nuevoTexto) => {
        if (!nuevoTexto.trim()) return false;

        const nuevosComentarios = { ...comentariosPorCancion };

        if (nuevosComentarios[cancionId]) {
            const index = nuevosComentarios[cancionId].findIndex(c => c.id === comentarioId);

            if (index !== -1) {
                nuevosComentarios[cancionId][index].texto = nuevoTexto;
                nuevosComentarios[cancionId][index].editado = new Date().toISOString();
                guardarComentarios(nuevosComentarios);
                return true;
            }
        }

        return false;
    };

    // Agregar like a un comentario
    const likeComentario = (cancionId, comentarioId) => {
        const nuevosComentarios = { ...comentariosPorCancion };

        if (nuevosComentarios[cancionId]) {
            const comentario = nuevosComentarios[cancionId].find(c => c.id === comentarioId);

            if (comentario) {
                comentario.likes = (comentario.likes || 0) + 1;
                guardarComentarios(nuevosComentarios);
                return true;
            }
        }

        return false;
    };

    return {
        agregarComentario,
        obtenerComentarios,
        eliminarComentario,
        editarComentario,
        likeComentario,
        comentariosPorCancion
    };
};




