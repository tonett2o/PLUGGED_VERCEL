/**
 * useSearch.js - Hook de busqueda global
 *
 * Realiza una peticion GET al endpoint /api/buscar con el termino indicado
 * y devuelve los resultados organizados en cuatro categorias:
 *   artistas    - Usuarios de la plataforma
 *   canciones   - Tracks musicales
 *   colecciones - Albums y EPs
 *   playlists   - Listas de reproduccion
 *
 * Si la consulta tiene menos de 2 caracteres, devuelve arrays vacios
 * sin hacer ninguna peticion al servidor.
 *
 * En caso de error de red o respuesta no OK, tambien devuelve arrays vacios
 * para que la UI no rompa y simplemente no muestre resultados.
 *
 * @param {string} query - Termino de busqueda introducido por el usuario
 * @returns {object} Objeto con { artistas, canciones, colecciones, playlists }
 */
import API_URL from '../../config/api.js'

const useSearch = async (query) => {
    // No buscar si el termino es demasiado corto
    if (!query || query.trim().length < 2) {
        return { artistas: [], canciones: [], colecciones: [], playlists: [] };
    }

    try {
        const response = await fetch(`${API_URL}/api/buscar?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            return { artistas: [], canciones: [], colecciones: [], playlists: [] };
        }

        const data = await response.json();

        // Normalizar la respuesta: el backend devuelve 'usuarios' pero el frontend usa 'artistas'
        return {
            artistas: data.usuarios || [],
            canciones: data.canciones || [],
            colecciones: data.colecciones || [],
            playlists: data.playlists || []
        };
    } catch (error) {
        console.error('Error en busqueda:', error);
        return { artistas: [], canciones: [], colecciones: [], playlists: [] };
    }
};

export default useSearch;
