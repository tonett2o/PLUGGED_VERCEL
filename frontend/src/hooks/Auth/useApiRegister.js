/**
 * useApiRegister.js - Hook de registro de nuevo usuario
 *
 * Envia el FormData de registro al endpoint POST /api/register usando
 * axios base (no la instancia preconfigurada con Content-Type: JSON).
 *
 * Es importante NO establecer Content-Type manualmente cuando se envia
 * FormData: Axios lo detecta automaticamente y genera el boundary correcto
 * para multipart/form-data, lo que permite subir archivos (avatar).
 *
 * En caso de error de validacion del backend, devuelve el objeto de errores
 * para que el componente los muestre campo a campo.
 *
 * @param {FormData} formData - Datos del formulario de registro
 * @returns {object} Respuesta de la API o { error: true, detalles: {...} }
 */
import API_URL from '../../config/api.js'
import axios from 'axios';

const useApiRegister = async (formData) => {
    try {
        // Usar axios base sin instancia preconfigurada para no sobreescribir Content-Type
        const { data } = await axios.post(`${API_URL}/api/register`, formData, {
            headers: {
                'Accept': 'application/json',
                // NO incluir Content-Type: Axios lo calcula automaticamente para FormData
            }
        });
        return data;
    } catch (error) {
        return { error: true, detalles: error.response?.data?.errors || error.message };
    }
};

export default useApiRegister;
