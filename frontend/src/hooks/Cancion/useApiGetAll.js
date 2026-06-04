const useApiGetAll = async () => {
    let respuesta = null;
    let peticion = await fetch("http://localhost:8000/api/canciones");
    let canciones = await peticion.json();

    if (Array.isArray(canciones) && peticion.ok) {
        respuesta = canciones;
    }
    return respuesta;
}

export default useApiGetAll;