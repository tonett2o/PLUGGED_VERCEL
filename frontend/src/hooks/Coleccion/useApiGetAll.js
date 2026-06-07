import API_URL from '../../config/api.js'
const useApiGetAll = async () => {
    let respuesta = null;
    let peticion = await fetch(`${API_URL}/api/colecciones`);
    let colecciones = await peticion.json();

    if (Array.isArray(colecciones) && peticion.ok) {
        respuesta = colecciones;
    }
    return respuesta;
}

export default useApiGetAll;



