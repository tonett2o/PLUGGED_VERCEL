import axios from 'axios';

const clienteAxios = axios.create({
    // Cambia esto por la URL de tu backend de Laravel
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// --- INTERCEPTOR PARA EL TOKEN ---
// Este código se ejecuta ANTES de enviar cualquier petición
clienteAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Si hay un token, lo añadimos a las cabeceras Authorization
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- INTERCEPTOR PARA ERRORES (Opcional pero recomendado) ---
clienteAxios.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si el servidor devuelve 401 (No autorizado), el token ha caducado
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            // Opcional: window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default clienteAxios;