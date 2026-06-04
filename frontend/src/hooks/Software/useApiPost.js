import API_URL from '../../config/api.js'
const useApiPost = async (softwareCreado, token) => {
    let respuesta = null;

    const formData = new FormData();
    formData.append('nombre', softwareCreado.nombre);
    formData.append('version', softwareCreado.version);
    formData.append('distribuidor', softwareCreado.distribuidor);
    formData.append('precio', softwareCreado.precio);
    formData.append('tipo_pago', softwareCreado.tipo_pago); // 'unico', 'suscripcion', etc.
    formData.append('descripcion', softwareCreado.descripcion || '`);

    if (softwareCreado.imagen) {
        formData.append('imagen', softwareCreado.imagen); // Archivo File
    }

    const peticion = await fetch(`${API_URL}/api/software", {
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



