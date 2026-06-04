import API_URL from '../../config/api.js'
const useApiGet = async (id) => {
    let respuesta = null;
    let peticion = await fetch(`${API_URL}/api/hardware/${id}`);
    let hardware = await peticion.json();

    if (hardware.id == id && peticion.ok) {
        respuesta = hardware;
    }
    return respuesta;
}

export default useApiGet;



