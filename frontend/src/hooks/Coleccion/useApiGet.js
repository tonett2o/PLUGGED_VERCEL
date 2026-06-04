import API_URL from '../../config/api.js'
const useApiGet = async (id) => {
    let respuesta = null;
    let peticion = await fetch(`${API_URL}/api/colecciones/${id}`);
    let coleccion = await peticion.json();

    if (coleccion.id == id && peticion.ok) {
        respuesta = coleccion;
    }
    return respuesta;
}

export default useApiGet;



