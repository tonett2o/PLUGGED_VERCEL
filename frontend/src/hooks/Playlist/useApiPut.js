/**
 * Hook para actualizar una playlist mediante PUT
 * Propaga errores de validación con detalles por campo
 */
const useApiPut = async (id, playlistEditada, token) => {
    const formData = new FormData();
    formData.append('titulo', playlistEditada.titulo);
    formData.append('descripcion', playlistEditada.descripcion || '');
    formData.append('privacidad', playlistEditada.privacidad);

    const soloAnio = playlistEditada.fecha_publicacion.toString().substring(0, 4);
    formData.append('fecha_publicacion', soloAnio);

    // Simulación de PUT para Laravel
    formData.append('_method', 'PUT');

    // Solo adjuntamos si es un archivo nuevo
    if (playlistEditada.portada instanceof File) {
        formData.append('portada', playlistEditada.portada);
    }

    // Colaboradores (array de IDs) - siempre enviar para permitir remover todos
    if (Array.isArray(playlistEditada.colaboradores)) {
        formData.append('colaboradores', JSON.stringify(playlistEditada.colaboradores));
    }

    try {
        const peticion = await fetch(`http://localhost:8000/api/playlists/${id}`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        const datosJson = await peticion.json();

        if (peticion.ok) {
            return datosJson;
        }

        // Capturar errores de validación (detalles o errors como fallback)
        return {
            error: true,
            message: datosJson.message || "Error al actualizar playlist",
            detalles: datosJson.detalles || datosJson.errors || {},
            status: peticion.status
        };
    } catch (error) {
        console.error("Error en useApiPut de Playlist:", error);
        return {
            error: true,
            message: "Error de conexión",
            detalles: {},
            status: 0
        };
    }
};

export default useApiPut;