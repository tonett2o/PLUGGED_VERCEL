const useApiPut = async (id, eventoEditado, token) => {
    let respuesta = null;

    const formData = new FormData();
    formData.append('nombre', eventoEditado.nombre);
    formData.append('nombre_sala', eventoEditado.nombre_sala || '');

    // Manejar ubicación: puede venir como string o como objeto {direccion, lat, lng}
    let ubicacionTexto = '';
    if (typeof eventoEditado.ubicacion === 'object' && eventoEditado.ubicacion !== null) {
        ubicacionTexto = eventoEditado.ubicacion.direccion || eventoEditado.ubicacion.direction || '';
    } else {
        ubicacionTexto = eventoEditado.ubicacion || '';
    }
    formData.append('ubicacion', ubicacionTexto);

    formData.append('latitud', eventoEditado.latitud || '');
    formData.append('longitud', eventoEditado.longitud || '');
    formData.append('fecha_evento', eventoEditado.fecha_evento || '');
    formData.append('url_venta', eventoEditado.url_venta || '');

    // TRUCO LARAVEL: Para enviar archivos en una edición
    formData.append('_method', 'PUT');

    // Solo adjuntamos imagen si el usuario seleccionó una nueva
    if (eventoEditado.imagen instanceof File) {
        formData.append('imagen', eventoEditado.imagen);
    }

    // Estilos: enviar como array JSON
    if (eventoEditado.estilos && Array.isArray(eventoEditado.estilos)) {
        formData.append('estilos', JSON.stringify(eventoEditado.estilos));
    }

    // Colaboradores (array de IDs) - SIEMPRE enviar para permitir remover todos
    let colaboradoresArray = [];
    if (Array.isArray(eventoEditado.colaboradores)) {
        // Extraer solo IDs si son objetos, o usar directamente si son números
        colaboradoresArray = eventoEditado.colaboradores.map(colab =>
            typeof colab === 'object' ? colab.id : colab
        );
    }
    formData.append('colaboradores', JSON.stringify(colaboradoresArray));

    const peticion = await fetch(`http://localhost:8000/api/eventos/${id}`, {
        method: "POST", // POST es obligatorio para FormData
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
        // El backend retorna 'detalles', no 'errors'
        respuesta = {
            error: true,
            message: datosJson.message || 'Error al actualizar evento',
            detalles: datosJson.detalles || {},
            status: peticion.status
        };
    }

    return respuesta;
};

export default useApiPut;