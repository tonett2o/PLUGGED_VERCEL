import API_URL from '../../config/api.js'
const useApiDelete = async (id, token) => {
    let respuesta = null;

    const peticion = await fetch(`${API_URL}/api/playlists/${id}`, {
        method: "DELETE",
        headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (peticion.ok) {
        respuesta = { success: true };
    } else {
        // Algunas APIs devuelven un JSON incluso en el error de borrado
        try {
            const datosJson = await peticion.json();
            respuesta = { error: true, detalles: datosJson.message, status: peticion.status };
        } catch (e) {
            respuesta = { error: true, detalles: "Error al borrar", status: peticion.status };
        }
    }

    return respuesta;
};

export default useApiDelete;



