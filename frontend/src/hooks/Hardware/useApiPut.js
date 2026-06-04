const useApiPut = async (id, hardwareEditado, token) => {
    let respuesta = null;

    const formData = new FormData();
    formData.append('nombre', hardwareEditado.nombre);
    formData.append('marca', hardwareEditado.marca);
    formData.append('precio', hardwareEditado.precio);
    formData.append('descripcion', hardwareEditado.descripcion || '');
    
    // Simulación de PUT para Laravel al enviar archivos
    formData.append('_method', 'PUT');

    if (hardwareEditado.imagen instanceof File) {
        formData.append('imagen', hardwareEditado.imagen);
    }

    const peticion = await fetch(`http://localhost:8000/api/hardware/${id}`, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: formData
    });

    const datosJson = await peticion.json();

    if (peticion.ok) {
        respuesta = datosJson;
    } else {
        respuesta = { error: true, detalles: datosJson.errors, status: peticion.status };
    }

    return respuesta;
};

export default useApiPut;