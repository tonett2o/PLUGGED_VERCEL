/**
 * api.js - URL base de la API backend
 *
 * Detecta el entorno de ejecucion a partir del hostname del navegador:
 * - localhost  -> apunta al servidor Laravel local (puerto 8000)
 * - cualquier otro dominio -> apunta al servidor de produccion en Railway
 *
 * Todos los hooks y componentes importan esta constante para construir
 * sus endpoints, evitando URLs hardcodeadas dispersas por el proyecto.
 */
const API_URL =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8000'
    : 'https://pluggedvercel-production.up.railway.app';


export default API_URL;
