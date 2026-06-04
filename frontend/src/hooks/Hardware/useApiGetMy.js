import API_URL from '../../config/api.js'
const useApiGetMy = async (usuarioId) => {
    let respuesta = null;

    if (!usuarioId) return respuesta;

    try {
        let peticion = await fetch(`${API_URL}/api/usuarios/${usuarioId}`);

        if (peticion.ok) {
            let datos = await peticion.json();
            // Retorna el array de hardwares del usuario
            respuesta = datos.hardwares || [];
        }
    } catch (error) {
        console.error("Error al obtener hardwares del usuario:", error);
    }

    return respuesta;
}

export default useApiGetMy;




