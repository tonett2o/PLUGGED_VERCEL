const useApiGet = async (id) => {
    let respuesta = null;
    let peticion = await fetch(`http://localhost:8000/api/playlists/${id}`);
    let playlist = await peticion.json();

    if (playlist.id == id && peticion.ok) {
        respuesta = playlist;
    }
    return respuesta;
}

export default useApiGet;