/**
 * useComentarios.js - Hook de gestion de comentarios en canciones
 *
 * Implementa un sistema de comentarios persistido en localStorage.
 * Los comentarios se vinculan a una posicion temporal de la cancion (segundo),
 * lo que permite mostrarlos sincronizados con la reproduccion.
 *
 * Nota: los comentarios se guardan localmente en el navegador del usuario,
 * no se sincronizan con el backend ni son visibles para otros usuarios.
 * Cada comentario incluye el timestamp de la cancion en el que fue creado.
 *
 * Operaciones disponibles:
 *   agregarComentario(cancionId, texto, tiempoActual) - Crea un comentario en la posicion actual
 *   obtenerComentarios(cancionId) - Lista todos los comentarios de una cancion
 *   eliminarComentario(cancionId, comentarioId) - Elimina un comentario por id
 *   editarComentario(cancionId, comentarioId, nuevoTexto) - Edita el texto de un comentario
 *   likeComentario(cancionId, comentarioId) - Incrementa el contador de likes de un comentario
 *
 * @returns {object} Objeto con las funciones de gestion y el estado actual
 */
import API_URL from '../../config/api.js'
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/ProveedorAuth';

export const useComentarios = () => {
    const { usuario } = useAuth();
    // Mapa de comentarios por cancion: { [cancionId]: Array<comentario> }
    const [comentariosPorCancion, setComentariosPorCancion] = useState({});

    // Al montar el hook, carga los comentarios persistidos en localStorage
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

    /**
     * Persiste el mapa de comentarios en localStorage y actualiza el estado.
     * @param {object} nuevosComentarios - Mapa completo actualizado
     */
    const guardarComentarios = (nuevosComentarios) => {
        setComentariosPorCancion(nuevosComentarios);
        localStorage.setItem('comentariosMusica', JSON.stringify(nuevosComentarios));
    };

    /**
     * Crea un nuevo comentario vinculado a la posicion actual de la cancion.
     * Requiere usuario autenticado y texto no vacio.
     * El comentario se inserta al principio del array (orden cronologico inverso).
     *
     * @param {number} cancionId    - ID de la cancion
     * @param {string} texto        - Contenido del comentario
     * @param {number} tiempoActual - Segundo de la cancion en el que se comenta
     * @returns {object|null} Comentario creado o null si no se pudo crear
     */
    const agregarComentario = (cancionId, texto, tiempoActual = 0) => {
        if (!texto.trim() || !usuario) return null;

        const nuevosComentarios = { ...comentariosPorCancion };

        if (!nuevosComentarios[cancionId]) {
            nuevosComentarios[cancionId] = [];
        }

        // Formatear el tiempo como MM:SS para mostrarlo en la UI
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
            timestamp: tiempoFormato,        // Formato legible "MM:SS"
            tiempoSegundos: tiempoActual,    // Segundos para comparar con currentTime
            fechaCreacion: new Date().toISOString(),
            likes: 0
        };

        // Insertar al principio para mostrar el mas reciente primero
        nuevosComentarios[cancionId] = [comentario, ...nuevosComentarios[cancionId]];
        guardarComentarios(nuevosComentarios);

        return comentario;
    };

    /**
     * Devuelve todos los comentarios de una cancion.
     * @param {number} cancionId - ID de la cancion
     * @returns {Array} Array de comentarios o array vacio
     */
    const obtenerComentarios = (cancionId) => {
        return comentariosPorCancion[cancionId] || [];
    };

    /**
     * Elimina un comentario por su id. Si la cancion se queda sin comentarios,
     * elimina la entrada del mapa para no acumular claves vacias.
     *
     * @param {number} cancionId    - ID de la cancion
     * @param {number} comentarioId - ID del comentario a eliminar
     * @returns {boolean} true si se elimino, false si no existia
     */
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

    /**
     * Edita el texto de un comentario existente y marca la fecha de edicion.
     *
     * @param {number} cancionId    - ID de la cancion
     * @param {number} comentarioId - ID del comentario a editar
     * @param {string} nuevoTexto   - Nuevo contenido del comentario
     * @returns {boolean} true si se edito, false si no existe o texto vacio
     */
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

    /**
     * Incrementa en 1 el contador de likes de un comentario.
     * No valida si el usuario ya habia dado like anteriormente.
     *
     * @param {number} cancionId    - ID de la cancion
     * @param {number} comentarioId - ID del comentario
     * @returns {boolean} true si se actualizo, false si no existe
     */
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
