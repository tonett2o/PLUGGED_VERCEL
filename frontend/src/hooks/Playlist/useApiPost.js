/**
 * Hook para crear una playlist mediante POST
 * Construye FormData con todos los campos incluyendo colaboradores
 */
const useApiPost = async (playlistData, token) => {
    const formData = new FormData();

    // Campos base
    formData.append('titulo', playlistData.titulo);
    formData.append('privacidad', playlistData.privacidad);
    formData.append('fecha_publicacion', playlistData.fecha_publicacion);
    formData.append('id_usuario', playlistData.id_usuario);

    // Descripción (opcional)
    if (playlistData.descripcion && playlistData.descripcion !== "") {
        formData.append('descripcion', playlistData.descripcion);
    }

    // Portada (archivo)
    if (playlistData.portada) {
        formData.append('portada', playlistData.portada);
    }

    // Colaboradores (array de IDs)
    if (playlistData.colaboradores && Array.isArray(playlistData.colaboradores) && playlistData.colaboradores.length > 0) {
        formData.append('colaboradores', JSON.stringify(playlistData.colaboradores));
    }

    try {
        const peticion = await fetch("http://localhost:8000/api/playlists", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        const datosJson = await peticion.json();

        // Si es exitoso (201), devolver directamente
        if (peticion.ok) {
            return datosJson;
        }

        // Si hay error de validación (422), capturar detalles
        if (peticion.status === 422) {
            return {
                error: true,
                message: datosJson.message || "Error de validación",
                detalles: datosJson.detalles || {},
                status: 422
            };
        }

        // Otros errores
        return {
            error: true,
            message: datosJson.message || "Error al crear playlist",
            detalles: datosJson.detalles || {},
            status: peticion.status
        };
    } catch (error) {
        console.error("Error en useApiPost de Playlist:", error);
        return {
            error: true,
            message: "Error de conexión",
            detalles: {},
            status: 0
        };
    }
};

export default useApiPost;