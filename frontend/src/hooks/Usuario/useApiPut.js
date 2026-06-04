const useApiPut = async (id, usuarioEditado, token) => {
    let respuesta = null;

    const formData = new FormData();
    formData.append('nick', usuarioEditado.nick);
    formData.append('nombre', usuarioEditado.nombre);
    
    // Hacemos que estos campos se añadan solo si existen para no enviar "undefined"
    if (usuarioEditado.email) formData.append('email', usuarioEditado.email);
    if (usuarioEditado.rol) formData.append('rol', usuarioEditado.rol);
    
    // 🆕 AÑADIDOS LOS NUEVOS CAMPOS DEL PERFIL
    formData.append('ubicacion', usuarioEditado.ubicacion || '');
    formData.append('biografia', usuarioEditado.biografia || '');
    formData.append('latitud', usuarioEditado.latitud || '');
    formData.append('longitud', usuarioEditado.longitud || '');

    // 🆕 REDES SOCIALES
    formData.append('twitter', usuarioEditado.twitter || '');
    formData.append('instagram', usuarioEditado.instagram || '');
    formData.append('youtube', usuarioEditado.youtube || '');
    formData.append('spotify', usuarioEditado.spotify || '');
    formData.append('tiktok', usuarioEditado.tiktok || '');
    formData.append('soundcloud', usuarioEditado.soundcloud || '');
    
    // Simulación de PUT para Laravel (necesario para procesar archivos binarios)
    formData.append('_method', 'PUT');

    if (usuarioEditado.avatar instanceof File) {
        formData.append('avatar', usuarioEditado.avatar);
    }
    
    // 🆕 AÑADIDO PARA SOPORTAR EL BANNER
    if (usuarioEditado.banner instanceof File) {
        formData.append('banner', usuarioEditado.banner);
    }

    const peticion = await fetch(`http://localhost:8000/api/usuarios/${id}`, {
        method: "POST", // Se envía como POST pero Laravel lo lee como PUT
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
        respuesta = {
            error: true,
            detalles: datosJson.detalles || datosJson.errors || {},
            message: datosJson.message || 'Error al actualizar perfil',
            status: peticion.status
        };
    }

    return respuesta;
};

export default useApiPut;