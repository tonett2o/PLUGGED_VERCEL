import API_URL from '../../config/api.js'
const useApiPost = async (cancionCreada, token) => {
    let respuesta = null;

    const formData = new FormData();

    // 1. Campos obligatorios base
    formData.append('titulo', cancionCreada.titulo);
    if (cancionCreada.archivo) {
        formData.append('archivo', cancionCreada.archivo); // El .mp3 binario
    }

    // 2. Campos adicionales
    if (cancionCreada.bpm && cancionCreada.bpm !== "") {
        formData.append('bpm', parseInt(cancionCreada.bpm, 10));
    }
    if (cancionCreada.tonalidad && cancionCreada.tonalidad !== "") {
        formData.append('tonalidad', cancionCreada.tonalidad);
    }
    
    // 🚨 NUEVOS CAMPOS: Estilos (array) y Privacidad
    if (cancionCreada.estilos && Array.isArray(cancionCreada.estilos) && cancionCreada.estilos.length > 0) {
        // Enviar array de IDs de estilos como JSON
        formData.append('estilos', JSON.stringify(cancionCreada.estilos));
    }
    // Fallback: si viene el campo antiguo 'estilo' (para backwards compatibility)
    else if (cancionCreada.estilo && cancionCreada.estilo !== "") {
        formData.append('estilo', cancionCreada.estilo);
    }

    if (cancionCreada.privacidad && cancionCreada.privacidad !== "") {
        formData.append('privacidad', cancionCreada.privacidad);
    }

    if (cancionCreada.portada) {
        formData.append('portada', cancionCreada.portada);
    }

    // 3. SOLUCIÓN DEFINITIVA PARA LAS RELACIONES
    if (cancionCreada.id_coleccion && cancionCreada.id_coleccion !== "" && cancionCreada.id_coleccion !== null) {
        // Convertir a número para asegurar que el backend lo reciba como int
        formData.append('id_coleccion', parseInt(cancionCreada.id_coleccion, 10));
    }
    
    if (cancionCreada.id_playlist && cancionCreada.id_playlist !== "" && cancionCreada.id_playlist !== null) {
        formData.append('id_playlist', cancionCreada.id_playlist);
    }

    // Colaboradores (array de IDs)
    if (cancionCreada.colaboradores && Array.isArray(cancionCreada.colaboradores) && cancionCreada.colaboradores.length > 0) {
        formData.append('colaboradores', JSON.stringify(cancionCreada.colaboradores));
    }

    // 4. Ejecución del envío
    const peticion = await fetch(`${API_URL}/api/canciones`, {
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
        respuesta = {
            error: true,
            detalles: datosJson.detalles || datosJson.errors,
            message: datosJson.message,
            status: peticion.status
        };
    }

    return respuesta;
};

export default useApiPost;



