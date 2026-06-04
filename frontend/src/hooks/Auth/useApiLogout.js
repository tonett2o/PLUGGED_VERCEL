import API_URL from '../../config/api.js'
import clienteAxios from '../../auth/axios.js';

const useApiLogout = async () => {
    try {
        await clienteAxios.post('/logout');
        return true;
    } catch (error) {
        console.error("Error al cerrar sesión en el servidor:", error.response?.data);
        // Devolvemos true de todos modos para que el Front limpie la sesión local
        return true; 
    }
};

export default useApiLogout;



