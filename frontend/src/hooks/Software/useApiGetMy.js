import API_URL from '../../config/api.js'
const useApiGetMy = async (usuarioId) => {
    let respuesta = null;

    if (!usuarioId) return respuesta;

    try {
        let peticion = await fetch(`${API_URL}/api/usuarios/${usuarioId}`);

        if (peticion.ok) {
            let datos = await peticion.json();
            // Retorna el array de softwares del usuario
            respuesta = datos.softwares || [];
        }
    } catch (error) {
        console.error("Error al obtener softwares del usuario:", error);
    }

    return respuesta;
}

export default useApiGetMy;




