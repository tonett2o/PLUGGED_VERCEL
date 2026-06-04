export const generos46 = [
    // 8 Principales
    { id: 1, nombre: 'House', color: '#0ADAF5' },
    { id: 2, nombre: 'Techno', color: '#FF006E' },
    { id: 3, nombre: 'Trance', color: '#FFD700' },
    { id: 4, nombre: 'Drum & Bass', color: '#00FF00' },
    { id: 5, nombre: 'Dubstep', color: '#FF7F00' },
    { id: 6, nombre: 'Deep House', color: '#00BFFF' },
    { id: 7, nombre: 'Tech House', color: '#FF1493' },
    { id: 8, nombre: 'Minimal', color: '#32CD32' },

    // 38 Secundarios
    { id: 9, nombre: 'Progressive House', color: '#1E90FF' },
    { id: 10, nombre: 'Acid House', color: '#00CED1' },
    { id: 11, nombre: 'Electro House', color: '#0099FF' },
    { id: 12, nombre: 'Future House', color: '#00FFFF' },
    { id: 13, nombre: 'French Touch', color: '#87CEEB' },
    { id: 14, nombre: 'Soulful House', color: '#6495ED' },

    { id: 15, nombre: 'Industrial Techno', color: '#DC143C' },
    { id: 16, nombre: 'Acid Techno', color: '#FF4500' },
    { id: 17, nombre: 'Detroit Techno', color: '#FF6347' },
    { id: 18, nombre: 'Berlin Techno', color: '#CD5C5C' },
    { id: 19, nombre: 'Hyperpop Techno', color: '#FF69B4' },

    { id: 20, nombre: 'Psytrance', color: '#FFB6C1' },
    { id: 21, nombre: 'Goa Trance', color: '#FFC0CB' },
    { id: 22, nombre: 'Hard Trance', color: '#FFD700' },
    { id: 23, nombre: 'Progressive Trance', color: '#FFED4E' },
    { id: 24, nombre: 'Uplifting Trance', color: '#FFFF00' },

    { id: 25, nombre: 'Liquid Funk', color: '#00FA9A' },
    { id: 26, nombre: 'Jump Up', color: '#3CB371' },
    { id: 27, nombre: 'Neurofunk', color: '#228B22' },
    { id: 28, nombre: 'Jungle', color: '#008000' },

    { id: 29, nombre: 'Brostep', color: '#FF8C00' },
    { id: 30, nombre: 'Riddim', color: '#FF7F50' },
    { id: 31, nombre: 'Melodic Dubstep', color: '#FFAA00' },
    { id: 32, nombre: 'Riddim Dubstep', color: '#FF9500' },

    { id: 33, nombre: 'Synthwave', color: '#FF00FF' },
    { id: 34, nombre: 'Retrowave', color: '#FF1493' },
    { id: 35, nombre: 'Darkwave', color: '#8B008B' },
    { id: 36, nombre: 'Chillwave', color: '#9932CC' },
    { id: 37, nombre: 'Vaporwave', color: '#DA70D6' },

    { id: 38, nombre: 'Breakbeat', color: '#00CED1' },
    { id: 39, nombre: 'Drum & Bass Liquid', color: '#20B2AA' },
    { id: 40, nombre: 'Ambient', color: '#4169E1' },
    { id: 41, nombre: 'Downtempo', color: '#6A5ACD' },
    { id: 42, nombre: 'Leftfield', color: '#9370DB' },
    { id: 43, nombre: 'IDM', color: '#BA55D3' },
    { id: 44, nombre: 'Experimental', color: '#DDA0DD' },
    { id: 45, nombre: 'Glitch', color: '#FF00FF' },
    { id: 46, nombre: 'Noise', color: '#8B0000' },
];

export function getColorForGenre(genreId) {
    const genre = generos46.find(g => g.id === genreId);
    return genre?.color || '#808080';
}

export function getGenresByIds(ids = []) {
    return ids
        .map(id => generos46.find(g => g.id === id))
        .filter(Boolean);
}

export function getGenreById(id) {
    return generos46.find(g => g.id === id);
}
