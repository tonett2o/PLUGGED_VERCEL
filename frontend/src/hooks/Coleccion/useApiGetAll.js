const useApiGetAll = async () => {
    let respuesta = null;
    let peticion = await fetch("http://localhost:8000/api/colecciones");
    let colecciones = await peticion.json();
    console.log(colecciones);

    if (Array.isArray(colecciones) && peticion.ok) {
        respuesta = colecciones;
    }
    return respuesta;
}

export default useApiGetAll;