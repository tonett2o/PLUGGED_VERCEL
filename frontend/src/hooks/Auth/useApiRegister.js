import axios from 'axios'; // Importa axios directamente aquí

const useApiRegister = async (formData) => {
    try {
        // Usamos axios base (sin la configuración JSON que rompe el multipart)
        const { data } = await axios.post('http://localhost:8000/api/register', formData, {
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