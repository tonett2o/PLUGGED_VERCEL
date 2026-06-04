import API_URL from '../../config/api.js'
const useApiGetAll = async () => {
    let respuesta = null;
    let peticion = await fetch(`${API_URL}/api/hardware`);
    let hardware = await peticion.json();
    console.log(hardware);

    if (Array.isArray(hardware) && peticion.ok) {
        respuesta = hardware;
    }
    return respuesta;
}

export default useApiGetAll;



