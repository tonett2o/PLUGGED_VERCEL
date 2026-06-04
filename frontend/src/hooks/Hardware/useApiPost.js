import API_URL from '../../config/api.js'
const useApiPost = async (hardwareCreado, token) => {
    let respuesta = null;

    const formData = new FormData();
    formData.append('nombre', hardwareCreado.nombre);
    formData.append('marca', hardwareCreado.marca);
    formData.append('precio', hardwareCreado.precio);
    formData.append('descripcion', hardwareCreado.descripcion || '');

    if (hardwareCreado.imagen) {
        formData.append('imagen', hardwareCreado.imagen); // Archivo de imagen del equipo
    }

    const peticion = await fetch(`${API_URL}/api/hardware`, {
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

export default useApiPost;



