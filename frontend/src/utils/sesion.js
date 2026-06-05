/**
 * sesion.js - Utilidades para gestion de sesion desde localStorage
 *
 * Funciones auxiliares para leer el estado de autenticacion sin necesidad
 * de acceder al contexto de React. Utiles en hooks, funciones puras o
 * componentes que no esten dentro del arbol de ProveedorAuth.
 */

/**
 * Comprueba si hay una sesion activa verificando la existencia del token.
 *
 * @returns {boolean} true si hay token en localStorage, false en caso contrario
 */
export const tieneSesion = () => {
    return !!localStorage.getItem('token');
};

/**
 * Obtiene el objeto de usuario guardado en localStorage.
 * Parsea el JSON de forma segura; si esta corrupto devuelve null.
 *
 * @returns {object|null} Objeto con los datos del usuario o null si no hay sesion
 */
export const obtenerUsuarioActual = () => {
    const usuarioJson = localStorage.getItem('usuario');
    if (!usuarioJson) return null;
    try {
        return JSON.parse(usuarioJson);
    } catch (e) {
        return null;
    }
};
