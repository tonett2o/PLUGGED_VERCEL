/**
 * useApiLogout.js - Hook de cierre de sesion en el servidor
 *
 * Notifica al backend (POST /api/logout) para que invalide el token JWT.
 * El interceptor de Axios incluye automaticamente el token en la cabecera.
 *
 * Siempre devuelve true, incluso si el servidor no esta disponible o
 * devuelve un error. Esto es intencional: si el backend falla, el frontend
 * igualmente debe limpiar la sesion local (ver ProveedorAuth.desconectar).
 *
 * @returns {boolean} Siempre true
 */
import API_URL from '../../config/api.js'
import clienteAxios from '../../auth/axios.js';

const useApiLogout = async () => {
    try {
        await clienteAxios.post('/logout');
        return true;
    } catch (error) {
        console.error("Error al cerrar sesion en el servidor:", error.response?.data);
        // Aunque el backend falle, el frontend limpiara la sesion local igualmente
        return true;
    }
};

export default useApiLogout;
