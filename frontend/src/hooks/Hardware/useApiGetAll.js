const useApiGetAll = async () => {
    let respuesta = null;
    let peticion = await fetch("http://localhost:8000/api/hardware");
    let hardware = await peticion.json();
    console.log(hardware);

    if (Array.isArray(hardware) && peticion.ok) {
        respuesta = hardware;
    }
    return respuesta;
}

export default useApiGetAll;