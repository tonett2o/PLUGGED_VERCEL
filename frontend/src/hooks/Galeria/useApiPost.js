import API_URL from '../../config/api.js'
const useApiPost_Galeria = async (archivo, token) => {
    try {
        const formData = new FormData();
        formData.append('imagen', archivo);

        const response = await fetch(`${API_URL}/api/usuarios/galeria`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: formData
        });

        const datos = await response.json();

        if (!response.ok) {
            return {
                error: true,
                detalles: datos.detalles || datos.message || 'Error al subir la imagen'
            };
        }

        return datos;
    } catch (error) {
        console.error('Error uploading gallery image:', error);
        return { error: true, message: error.message };
    }
};

export default useApiPost_Galeria;




