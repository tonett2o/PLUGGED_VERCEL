import API_URL from '../../config/api.js'
const useApiGetAll = async () => {
    let respuesta = null;
    let peticion = await fetch(`${API_URL}/api/eventos`);
    let eventos = await peticion.json();
    console.log(eventos);

    if (Array.isArray(eventos) && peticion.ok) {
        respuesta = eventos;
    }
    return respuesta;
}

export default useApiGetAll;



