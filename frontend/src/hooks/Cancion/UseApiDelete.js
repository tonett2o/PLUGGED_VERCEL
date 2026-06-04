import API_URL from '../../config/api.js'
const useApiDelete = async (id, token) => {
    let respuesta = null;

    const peticion = await fetch(`${API_URL}/api/canciones/${id}`, {
        method: "DELETE",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    // Laravel suele devolver un 204 No Content o un mensaje de éxito
    if (peticion.ok) {
        respuesta = { success: true };
    } else {
        const datosJson = await peticion.json();
        respuesta = { error: true, detalles: datosJson.message, status: peticion.status };
    }

    return respuesta;
};

export default useApiDelete;



