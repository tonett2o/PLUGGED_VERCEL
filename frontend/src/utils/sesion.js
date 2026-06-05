/**
 * Verifica si el usuario tiene una sesión iniciada
 * @returns {boolean} true si hay token en localStorage
 */
export const tieneSesion = () => {
    return !!localStorage.getItem('token');
};

/**
 * Obtiene el usuario actual del localStorage
 * @returns {object|null} Objeto usuario o null si no hay sesión
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
