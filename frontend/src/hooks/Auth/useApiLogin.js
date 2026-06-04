import API_URL from '../../config/api.js'
import clienteAxios from '../../auth/axios.js';

const useApiLogin = async (email, password) => {
    try {
        const { data } = await clienteAxios.post('/login', { email, password });
        return data; 
    } catch (error) {
        console.error("Error en login:", error.response?.data?.message || "Credenciales inválidas`);
        return null;
    }
};

export default useApiLogin;



