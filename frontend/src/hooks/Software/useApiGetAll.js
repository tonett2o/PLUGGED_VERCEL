const useApiGetAll = async () => {
    let respuesta = null;
    let peticion = await fetch("http://localhost:8000/api/software");
    let software = await peticion.json();
    console.log(software);

    if (Array.isArray(software) && peticion.ok) {
        respuesta = software;
    }
    return respuesta;
}

export default useApiGetAll;