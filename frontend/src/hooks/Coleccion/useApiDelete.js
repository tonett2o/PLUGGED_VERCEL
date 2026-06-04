
import API_URL from '../../config/api.js'
const useApiDelete = async (id, token) => {
    let respuesta = null;

    const peticion = await fetch(`${API_URL}/api/colecciones/${id}`, {
        method: "DELETE",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (peticion.ok) {
        respuesta = { success: true };
    } else {
        const datosJson = await peticion.json();
        respuesta = { error: true, detalles: datosJson.message, status: peticion.status };
    }

    return respuesta;
};

export default useApiDelete;



