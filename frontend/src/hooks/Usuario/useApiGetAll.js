import API_URL from '../../config/api.js'

const useApiGetAll = async () => {
    let respuesta = null;
    let peticion = await fetch(`${API_URL}/api/usuarios`);
    let usuarios = await peticion.json();

    if (Array.isArray(usuarios) && peticion.ok) {
        respuesta = usuarios;
    }
    return respuesta;
}

export default useApiGetAll;



