import API_URL from '../../config/api.js'
// src/hooks/Coleccion/useApiPost.js

/**
 * Hook para crear una colección mediante POST
 * Construye FormData con todos los campos incluyendo colaboradores
 */
const useApiPost = async (coleccionData, token) => {
    const formData = new FormData();

    // Campos base
    formData.append('titulo', coleccionData.titulo);
    formData.append('artista', coleccionData.artista);
    formData.append('tipo', coleccionData.tipo);
    formData.append('privacidad', coleccionData.privacidad);
    formData.append('fecha_publicacion', coleccionData.fecha_publicacion);
    formData.append('id_usuario', coleccionData.id_usuario);

    // Descripción (opcional)
    if (coleccionData.descripcion && coleccionData.descripcion !== "") {
        formData.append('descripcion', coleccionData.descripcion);
    }

    // Portada (archivo)
    if (coleccionData.portada) {
        formData.append('portada', coleccionData.portada);
    }

    // Colaboradores (array de IDs)
    if (coleccionData.colaboradores && Array.isArray(coleccionData.colaboradores) && coleccionData.colaboradores.length > 0) {
        formData.append('colaboradores', JSON.stringify(coleccionData.colaboradores));
    }

    try {
        const response = await fetch(`${API_URL}/api/colecciones`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                error: true,
                message: data.message || "Error al crear colección",
                detalles: data.detalles || {},
                status: response.status
            };
        }

        return data;
    } catch (error) {
        console.error("Error en useApiPost de Colección:", error);
        return {
            error: true,
            message: error.message || "Error al crear colección",
            detalles: {},
            status: 500
        };
    }
};

export default useApiPost;




