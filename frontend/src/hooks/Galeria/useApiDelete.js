import API_URL from '../../config/api.js'
const useApiDelete_Galeria = async (id, token) => {
    try {
        const response = await fetch(`${API_URL}/api/usuarios/galeria/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        // Intentar parsear JSON solo si hay contenido
        let datos = {};
        const contentType = response.headers.get('content-type`);
        if (contentType && contentType.includes('application/json')) {
            const text = await response.text();
            if (text) {
                try {
                    datos = JSON.parse(text);
                } catch (e) {
                    console.error('Error parseando JSON:', e);
                    datos = {};
                }
            }
        }

        if (!response.ok) {
            return {
                error: true,
                detalles: datos.detalles || datos.message || 'Error al eliminar la imagen'
            };
        }

        return { ...datos, success: true };
    } catch (error) {
        console.error('Error:', error);
        return { error: true, message: error.message };
    }
};

export default useApiDelete_Galeria;




