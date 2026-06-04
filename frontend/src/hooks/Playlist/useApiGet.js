import API_URL from '../../config/api.js'
const useApiGet = async (id) => {
    let respuesta = null;
    let peticion = await fetch(`${API_URL}/api/playlists/${id}`);
    let playlist = await peticion.json();

    if (playlist.id == id && peticion.ok) {
        respuesta = playlist;
    }
    return respuesta;
}

export default useApiGet;



