const useApiGetAll = async () => {
    let respuesta = null;
    let peticion = await fetch("http://localhost:8000/api/eventos");
    let eventos = await peticion.json();
    console.log(eventos);

    if (Array.isArray(eventos) && peticion.ok) {
        respuesta = eventos;
    }
    return respuesta;
}

export default useApiGetAll;