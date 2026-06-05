/**
 * useApiGetAll.js - Obtiene todas las canciones del backend
 *
 * Llama al endpoint GET /api/canciones sin autenticacion.
 * Devuelve el array de canciones si la respuesta es correcta,
 * o null si el backend devuelve un error o el formato no es el esperado.
 *
 * @returns {Array|null} Array de canciones o null en caso de error
 */
import API_URL from '../../config/api.js'

const useApiGetAll = async () => {
    let respuesta = null;
    let peticion = await fetch(`${API_URL}/api/canciones`);
    let canciones = await peticion.json();

    if (Array.isArray(canciones) && peticion.ok) {
        respuesta = canciones;
    }
    return respuesta;
}

export default useApiGetAll;
