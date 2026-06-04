import API_URL from '../../config/api.js'
const useApiPut = async (id, coleccionEditada, token) => {
    let respuesta = null;

    const formData = new FormData();
    formData.append('titulo', coleccionEditada.titulo);
    formData.append('artista', coleccionEditada.artista);
    formData.append('descripcion', coleccionEditada.descripcion || '`);
    formData.append('privacidad', coleccionEditada.privacidad);
    formData.append('tipo', coleccionEditada.tipo);
    formData.append('fecha_publicacion', coleccionEditada.fecha_publicacion);
    
    // Simulación de PUT para Laravel
    formData.append('_method', 'PUT`);

    // Solo adjuntamos si es un archivo nuevo
    if (coleccionEditada.portada instanceof File) {
        formData.append('portada', coleccionEditada.portada);
    }

    // Colaboradores (array de IDs) - SIEMPRE enviar para permitir remover todos
    let colaboradoresArray = [];
    if (Array.isArray(coleccionEditada.colaboradores)) {
        // Extraer solo IDs si son objetos, o usar directamente si son números
        colaboradoresArray = coleccionEditada.colaboradores.map(colab =>
            typeof colab === 'object' ? colab.id : colab
        );
    }
    formData.append('colaboradores', JSON.stringify(colaboradoresArray));

    const peticion = await fetch(`${API_URL}/api/colecciones/${id}`, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: formData
    });

    const datosJson = await peticion.json();

    if (peticion.ok) {
        respuesta = datosJson;
    } else {
        // Capturar errores de validación (detalles o errors como fallback)
        respuesta = {
            error: true,
            message: datosJson.message || "Error al actualizar colección",
            detalles: datosJson.detalles || datosJson.errors || {},
            status: peticion.status
        };
    }

    return respuesta;
};

export default useApiPut;



