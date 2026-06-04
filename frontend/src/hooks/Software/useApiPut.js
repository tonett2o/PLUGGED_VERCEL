import API_URL from '../../config/api.js'
const useApiPut = async (id, softwareEditado, token) => {
    let respuesta = null;

    const formData = new FormData();
    formData.append('nombre', softwareEditado.nombre);
    formData.append('version', softwareEditado.version);
    formData.append('distribuidor', softwareEditado.distribuidor);
    formData.append('precio', softwareEditado.precio);
    formData.append('tipo_pago', softwareEditado.tipo_pago);
    formData.append('descripcion', softwareEditado.descripcion || '');

    // Simulación de PUT para que Laravel procese el archivo 'imagen'
    formData.append('_method', 'PUT');

    if (softwareEditado.imagen instanceof File) {
        formData.append('imagen', softwareEditado.imagen);
    }

    const peticion = await fetch(`${API_URL}/api/software/${id}`, {
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



