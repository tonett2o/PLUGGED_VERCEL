import API_URL from '../../config/api.js'
import axios from 'axios'; // Importa axios directamente aquí

const useApiRegister = async (formData) => {
    try {
        // Usamos axios base (sin la configuración JSON que rompe el multipart)
        const { data } = await axios.post('${API_URL}/api/register', formData, {
            headers: {
                'Accept': 'application/json',
                // NUNCA pongas Content-Type aquí, Axios lo detecta solo
            }
        });
        return data;
    } catch (error) {
        return { error: true, detalles: error.response?.data?.errors || error.message };
    }
};

export default useApiRegister;



