/**
 * useApiPost.js - Crea una nueva cancion en el backend
 *
 * Construye un FormData con todos los campos de la cancion y lo envia
 * al endpoint POST /api/canciones con autenticacion Bearer.
 *
 * La API espera FormData (no JSON) porque incluye archivos binarios:
 *   - archivo: el fichero de audio (.mp3, .wav, etc.)
 *   - portada: imagen de portada (opcional)
 *
 * Campos que acepta:
 *   titulo, archivo, bpm, tonalidad, estilos (JSON array de IDs),
 *   privacidad, portada, id_coleccion, id_playlist, colaboradores (JSON array)
 *
 * El campo 'estilos' se serializa como JSON porque FormData no soporta arrays
 * directamente. El backend deserializa este string antes de procesarlo.
 *
 * @param {object} cancionCreada - Objeto con los campos de la nueva cancion
 * @param {string} token         - JWT del usuario autenticado
 * @returns {object} Cancion creada o { error, detalles, message, status }
 */
import API_URL from '../../config/api.js'

const useApiPost = async (cancionCreada, token) => {
    let respuesta = null;

    const formData = new FormData();

    // Campos obligatorios
    formData.append('titulo', cancionCreada.titulo);
    if (cancionCreada.archivo) {
        formData.append('archivo', cancionCreada.archivo);
    }

    // Campos opcionales: solo se incluyen si tienen valor
    if (cancionCreada.bpm && cancionCreada.bpm !== "") {
        formData.append('bpm', parseInt(cancionCreada.bpm, 10));
    }
    if (cancionCreada.tonalidad && cancionCreada.tonalidad !== "") {
        formData.append('tonalidad', cancionCreada.tonalidad);
    }

    // Estilos musicales: se envian como JSON string por limitacion de FormData
    if (cancionCreada.estilos && Array.isArray(cancionCreada.estilos) && cancionCreada.estilos.length > 0) {
        formData.append('estilos', JSON.stringify(cancionCreada.estilos));
    } else if (cancionCreada.estilo && cancionCreada.estilo !== "") {
        // Compatibilidad con el campo antiguo 'estilo' (string simple)
        formData.append('estilo', cancionCreada.estilo);
    }

    if (cancionCreada.privacidad && cancionCreada.privacidad !== "") {
        formData.append('privacidad', cancionCreada.privacidad);
    }

    if (cancionCreada.portada) {
        formData.append('portada', cancionCreada.portada);
    }

    // Relaciones: coleccion y playlist
    if (cancionCreada.id_coleccion && cancionCreada.id_coleccion !== "" && cancionCreada.id_coleccion !== null) {
        // Convertir a entero para que el backend lo reciba como integer
        formData.append('id_coleccion', parseInt(cancionCreada.id_coleccion, 10));
    }

    if (cancionCreada.id_playlist && cancionCreada.id_playlist !== "" && cancionCreada.id_playlist !== null) {
        formData.append('id_playlist', cancionCreada.id_playlist);
    }

    // Colaboradores: array de IDs serializado como JSON
    if (cancionCreada.colaboradores && Array.isArray(cancionCreada.colaboradores) && cancionCreada.colaboradores.length > 0) {
        formData.append('colaboradores', JSON.stringify(cancionCreada.colaboradores));
    }

    const peticion = await fetch(`${API_URL}/api/canciones`, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
            // No incluir Content-Type: el navegador lo establece automaticamente con el boundary
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
