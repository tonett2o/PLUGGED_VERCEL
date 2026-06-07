import API_URL from '../../config/api.js'
const useApiGetAll = async () => {
    let respuesta = null;
    let peticion = await fetch(`${API_URL}/api/software`);
    let software = await peticion.json();

    if (Array.isArray(software) && peticion.ok) {
        respuesta = software;
    }
    return respuesta;
}

export default useApiGetAll;



