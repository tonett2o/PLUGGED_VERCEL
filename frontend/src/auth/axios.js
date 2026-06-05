/**
 * axios.js - Instancia de Axios preconfigurada para la API de PLUGGED
 *
 * Crea un cliente HTTP con la URL base del backend y dos interceptores:
 *
 *   Interceptor de peticion:
 *     Antes de enviar cualquier request, lee el token JWT de localStorage
 *     y lo agrega como cabecera Authorization: Bearer <token>.
 *     Esto evita tener que incluir el token manualmente en cada llamada.
 *
 *   Interceptor de respuesta:
 *     Si el servidor devuelve un 401 (token expirado o invalido),
 *     elimina las credenciales del localStorage para forzar un nuevo login.
 *     No redirige automaticamente para no interferir con la navegacion de React Router.
 *
 * Esta instancia se usa en los hooks de autenticacion (login, logout).
 * Los hooks de datos de la API usan fetch directamente para mayor control.
 */
import axios from 'axios';
import API_URL from '../config/api.js';

const clienteAxios = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

/**
 * Interceptor de peticion: adjunta el token JWT a cada request.
 * Si no hay token (usuario no autenticado), la peticion se envia sin cabecera.
 */
clienteAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Interceptor de respuesta: limpia la sesion si el token ha caducado (401).
 * El componente que llamo a la API recibira el error rechazado y podra manejarlo.
 */
clienteAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expirado o invalido: limpiar credenciales locales
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
        }
        return Promise.reject(error);
    }
);

export default clienteAxios;
