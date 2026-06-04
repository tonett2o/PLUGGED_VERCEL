const useApiGetMy = async (usuarioId) => {
    let respuesta = null;

    if (!usuarioId) return respuesta;

    try {
        let peticion = await fetch(`http://localhost:8000/api/usuarios/${usuarioId}`);

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
