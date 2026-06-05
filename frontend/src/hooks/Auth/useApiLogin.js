/**
 * useApiLogin.js - Hook de inicio de sesion
 *
 * Envia las credenciales al endpoint POST /api/login usando la instancia
 * de Axios preconfigurada (que gestiona baseURL y cabeceras automaticamente).
 *
 * Si el login es exitoso, devuelve el objeto con access_token y datos del usuario.
 * Si falla (credenciales incorrectas, servidor caido, etc.), devuelve null
 * para que el componente muestre el error adecuado.
 *
 * @param {string} email    - Email del usuario
 * @param {string} password - Contrasena del usuario
 * @returns {object|null} Respuesta de la API o null en caso de error
 */
import API_URL from '../../config/api.js'
import clienteAxios from '../../auth/axios.js';

const useApiLogin = async (email, password) => {
    try {
        const { data } = await clienteAxios.post('/login', { email, password });
        return data;
    } catch (error) {
        console.error("Error en login:", error.response?.data?.message || "Credenciales invalidas");
        return null;
    }
};

export default useApiLogin;
