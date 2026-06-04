import API_URL from '../../config/api.js'
const useApiPut = async (id, cancionEditada, token) => {
    let respuesta = null;

    const formData = new FormData();
    formData.append('titulo', cancionEditada.titulo);
    
    // Añadimos comprobaciones para no enviar "undefined" o "null" en texto
    if (cancionEditada.bpm) formData.append('bpm', cancionEditada.bpm);
    if (cancionEditada.tonalidad) formData.append('tonalidad', cancionEditada.tonalidad);
    // Convertir id_coleccion a número para asegurar que el backend lo reciba como int
    if (cancionEditada.id_coleccion) formData.append('id_coleccion', parseInt(cancionEditada.id_coleccion, 10));
    if (cancionEditada.id_playlist) formData.append('id_playlist', cancionEditada.id_playlist);
    
    // 🚨 NUEVOS CAMPOS: Estilos (array) y Privacidad
    if (cancionEditada.estilos && Array.isArray(cancionEditada.estilos) && cancionEditada.estilos.length > 0) {
        // Enviar array de IDs de estilos como JSON
        formData.append('estilos', JSON.stringify(cancionEditada.estilos));
    }
    // Fallback: si viene el campo antiguo 'estilo' (para backwards compatibility)
    else if (cancionEditada.estilo) {
        formData.append('estilo', cancionEditada.estilo);
    }

    if (cancionEditada.privacidad) {
        formData.append('privacidad', cancionEditada.privacidad);
    }
    
    // TRUCO LARAVEL: Para enviar archivos en una edición
    formData.append('_method', 'PUT`);

    // Solo adjuntamos archivos si el usuario seleccionó nuevos
    if (cancionEditada.archivo instanceof File) {
        formData.append('archivo', cancionEditada.archivo);
    }
    if (cancionEditada.portada instanceof File) {
        formData.append('portada', cancionEditada.portada);
    }

    // Colaboradores (array de IDs) - SIEMPRE enviar para permitir remover todos
    let colaboradoresArray = [];
    if (Array.isArray(cancionEditada.colaboradores)) {
        // Extraer solo IDs si son objetos, o usar directamente si son números
        colaboradoresArray = cancionEditada.colaboradores.map(colab =>
            typeof colab === 'object' ? colab.id : colab
        );
    }
    console.log('useApiPut_Cancion - enviando colaboradores:', colaboradoresArray);
    formData.append('colaboradores', JSON.stringify(colaboradoresArray));

    const peticion = await fetch(`${API_URL}/api/canciones/${id}`, {
        method: "POST", // Se mantiene POST por el FormData
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
        respuesta = {
            error: true,
            detalles: datosJson.detalles || datosJson.errors,
            message: datosJson.message,
            status: peticion.status
        };
    }

    return respuesta;
};

export default useApiPut;



