const useApiGetAll = async () => {
    let respuesta = null;
    let peticion = await fetch("http://localhost:8000/api/playlists");
    let playlists = await peticion.json();
    console.log(playlists);

    if (Array.isArray(playlists) && peticion.ok) {
        respuesta = playlists;
    }
    return respuesta;
}

export default useApiGetAll;