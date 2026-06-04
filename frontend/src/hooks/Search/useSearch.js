import API_URL from '../../config/api.js'
const useSearch = async (query) => {
    if (!query || query.trim().length < 2) {
        return { artistas: [], canciones: [], colecciones: [], playlists: [] };
    }

    try {
        const response = await fetch(`${API_URL}/api/buscar?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            return { artistas: [], canciones: [], colecciones: [], playlists: [] };
        }

        const data = await response.json();

        return {
            artistas: data.usuarios || [],
            canciones: data.canciones || [],
            colecciones: data.colecciones || [],
            playlists: data.playlists || []
        };
    } catch (error) {
        console.error('Error en búsqueda:', error);
        return { artistas: [], canciones: [], colecciones: [], playlists: [] };
    }
};

export default useSearch;




