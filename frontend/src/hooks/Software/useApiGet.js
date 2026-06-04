const useApiGet = async (id) => {
    let respuesta = null;
    let peticion = await fetch(`http://localhost:8000/api/software/${id}`);
    let software = await peticion.json();

    if (software.id == id && peticion.ok) {
        respuesta = software;
    }
    return respuesta;
}

export default useApiGet;