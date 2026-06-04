const useApiGet = async (id) => {
    let respuesta = null;
    let peticion = await fetch(`http://localhost:8000/api/colecciones/${id}`);
    let coleccion = await peticion.json();

    if (coleccion.id == id && peticion.ok) {
        respuesta = coleccion;
    }
    return respuesta;
}

export default useApiGet;