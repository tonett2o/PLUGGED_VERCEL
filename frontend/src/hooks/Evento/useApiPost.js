import API_URL from '../../config/api.js'
const useApiPost = async (eventoCreado, token) => {
    let respuesta = null;

    const formData = new FormData();
    formData.append('nombre', eventoCreado.nombre);
    formData.append('nombre_sala', eventoCreado.nombre_sala);
    formData.append('ubicacion', eventoCreado.ubicacion);
    formData.append('latitud', eventoCreado.latitud);
    formData.append('longitud', eventoCreado.longitud);
    formData.append('url_venta', eventoCreado.url_venta || '`);

    if (eventoCreado.fecha_evento) {
        formData.append('fecha_evento', eventoCreado.fecha_evento);
    }

    if (eventoCreado.imagen) {
        formData.append('imagen', eventoCreado.imagen);
    }

    // Estilos: enviar como array JSON
    if (eventoCreado.estilos && Array.isArray(eventoCreado.estilos)) {
        formData.append('estilos', JSON.stringify(eventoCreado.estilos));
    }

    const peticion = await fetch(`${API_URL}/api/eventos", {
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
        // El backend retorna 'detalles', no 'errors'
        respuesta = {
            error: true,
            message: datosJson.message || 'Error al crear evento',
            detalles: datosJson.detalles || {},
            status: peticion.status
        };
    }

    return respuesta;
};

export default useApiPost;



