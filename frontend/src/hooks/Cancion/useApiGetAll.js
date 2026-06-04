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



