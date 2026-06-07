import API_URL from '../../config/api.js'
const useApiGetAll = async () => {
    let respuesta = null;
    let peticion = await fetch(`${API_URL}/api/playlists`);
    let playlists = await peticion.json()

    if (Array.isArray(playlists) && peticion.ok) {
        respuesta = playlists;
    }
    return respuesta;
}

export default useApiGetAll;



