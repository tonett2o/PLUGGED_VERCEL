// Paleta de azules NEON: variaciones del azul cian brillante de la marca (#0ADAF5)
// Desde oscuro hasta claro manteniendo el look neon
const PALETA_AZULES = [
    // Azules neon oscuros
    '#003d7a',  // Azul neon muy oscuro
    '#004fa6',  // Azul neon oscuro
    '#0066cc',  // Azul neon medio-oscuro
    '#007fd9',  // Azul neon medio
    '#0099ff',  // Azul neon
    '#0aadff',  // Azul neon brillante
    '#0ADAF5',  // Azul neon principal (marca)
    '#1ae0ff',  // Azul neon claro
    '#3ae6ff',  // Azul neon muy claro
    '#5aecff',  // Azul neon ultra claro
    '#7af2ff',  // Azul neon casi blanco
    '#9af8ff',  // Azul neon blanco-ish
    '#baffff',  // Azul neon casi puro blanco
];

export const resolverRutaArchivo = (ruta) => {
    if (!ruta) return null;
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;

    // Normalizar ruta (eliminar / inicial si existe)
    const rutaNormalizada = ruta.replace(/^\/?/, '');

    // Si ya contiene /storage/, no agregar de nuevo
    if (rutaNormalizada.includes('/storage/')) {
        return `http://localhost:8000/${rutaNormalizada}`;
    }

    // Agregar /storage/ si no está presente (archivos del sistema)
    return `http://localhost:8000/storage/${rutaNormalizada}`;
};

export const generarAvatarDicebear = (nombre = 'usuario') => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nombre)}`;
};

export const generarPortadaPlaceholder = (titulo = 'Portada', esCancion = false) => {
    // Para canciones usar corchea estilo Apple Music
    if (esCancion) {
        return generarSVGCorchea();
    }

    // Para colecciones usar gradientes con paleta de colores
    return generarSVGGradiente(titulo);
};

const generarSVGCorchea = () => {
    // SVG con corchea estilo Apple Music - muy visible con fondo de gradiente
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
        <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#0f0f1e;stop-opacity:1" />
            </linearGradient>
        </defs>

        <!-- Fondo degradado oscuro -->
        <rect width="300" height="300" fill="url(#bgGradient)"/>

        <!-- Círculo de fondo para la corchea (destaca la nota) -->
        <circle cx="150" cy="150" r="100" fill="none" stroke="#0ADAF5" stroke-width="1" opacity="0.3"/>

        <!-- CORCHEA (nota musical) en AZUL CYAN BRILLANTE -->

        <!-- Cabeza de la nota (círculo grande y brillante) -->
        <ellipse cx="100" cy="220" rx="32" ry="36" fill="#0ADAF5" opacity="1"/>

        <!-- Brillo intenso en la cabeza -->
        <ellipse cx="92" cy="210" rx="18" ry="20" fill="#FFFFFF" opacity="0.35"/>

        <!-- Tallo de la nota (grueso y prominente) -->
        <rect x="128" y="30" width="14" height="195" fill="#0ADAF5" opacity="1" rx="7"/>

        <!-- Brillo en el tallo -->
        <rect x="130" y="35" width="6" height="180" fill="#FFFFFF" opacity="0.2" rx="3"/>

        <!-- Bandera/pabellón de la nota (forma curva grande) -->
        <path d="M 142 30 Q 210 20 220 90 Q 215 45 142 50 Z" fill="#0ADAF5" opacity="1"/>

        <!-- Brillo en la bandera -->
        <path d="M 145 32 Q 200 25 215 75 Q 212 48 145 53 Z" fill="#FFFFFF" opacity="0.2"/>

        <!-- Sombra suave en la base -->
        <ellipse cx="100" cy="260" rx="35" ry="10" fill="#000000" opacity="0.3"/>
    </svg>
    `;

    return 'data:image/svg+xml;base64,' + btoa(svg);
};

const generarSVGGradiente = (titulo = 'Portada') => {
    // Seleccionar 3 colores de la paleta de azules basados en el hash del título
    const indices = obtenerIndicesColores(titulo, 3);
    const color1 = PALETA_AZULES[indices[0]];
    const color2 = PALETA_AZULES[indices[1]];
    const color3 = PALETA_AZULES[indices[2]];

    // SVG con gradiente diagonal profesional
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
                <stop offset="50%" style="stop-color:${color2};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${color3};stop-opacity:1" />
            </linearGradient>
            <radialGradient id="noise" cx="50%" cy="50%" r="70%">
                <stop offset="0%" style="stop-color:white;stop-opacity:0.1" />
                <stop offset="100%" style="stop-color:black;stop-opacity:0.2" />
            </radialGradient>
        </defs>
        <rect width="300" height="300" fill="url(#grad1)"/>
        <rect width="300" height="300" fill="url(#noise)"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle" opacity="0.3">
            ${titulo.substring(0, 20)}
        </text>
    </svg>
    `;

    // Convertir a base64
    const svgBase64 = 'data:image/svg+xml;base64,' + btoa(svg);
    return svgBase64;
};

/**
 * Genera índices para seleccionar 3 azules en gradiente (oscuro -> claro)
 * Basado en el hash del string, asegura que mismo título = mismo gradiente
 */
const obtenerIndicesColores = (str = '', cantidad = 3) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Seleccionar punto de inicio aleatorio pero determinístico
    const maxStart = Math.max(0, PALETA_AZULES.length - 6);
    const startIndex = Math.abs(hash) % (maxStart + 1);

    // Retornar 3 índices: oscuro, medio, claro
    // Estos indices siempre van de menor a mayor para un gradiente ascendente
    return [
        startIndex,                              // Azul oscuro
        Math.min(startIndex + 5, PALETA_AZULES.length - 1),  // Azul medio
        Math.min(startIndex + 10, PALETA_AZULES.length - 1)  // Azul claro
    ];
};

export const generarColoresDesdeString = (str = '') => {
    // Función mantenida para compatibilidad, aunque ya no se usa en gradientes
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return {
        primary: `hsl(${hue}, 70%, 50%)`,
        secondary: `hsl(${hue}, 70%, 70%)`
    };
};
