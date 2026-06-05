/**
 * imagen.js - Utilidades para manejo y generacion de imagenes
 *
 * Centraliza la logica de:
 *   - Resolucion de rutas de archivos (locales o remotas)
 *   - Generacion de avatares placeholder via DiceBear
 *   - Generacion de portadas placeholder como SVG en base64
 *     (nota musical para canciones, gradiente azul para colecciones)
 *
 * La paleta de azules esta alineada con el color de marca (#0ADAF5).
 * Los gradientes son deterministicos: mismo titulo = mismo gradiente,
 * lo que evita que la portada "cambie de color" entre renders.
 */
import API_URL from '../config/api.js';

/**
 * Paleta de azules neon basada en el color de marca de PLUGGED (#0ADAF5).
 * Se usa para generar gradientes de portada cuando no hay imagen real.
 * El orden va de oscuro a claro para facilitar gradientes ascendentes.
 */
const PALETA_AZULES = [
    '#003d7a',
    '#004fa6',
    '#0066cc',
    '#007fd9',
    '#0099ff',
    '#0aadff',
    '#0ADAF5',  // Color principal de la marca
    '#1ae0ff',
    '#3ae6ff',
    '#5aecff',
    '#7af2ff',
    '#9af8ff',
    '#baffff',
];

/**
 * Construye la URL completa de un archivo almacenado en el servidor.
 * - Si la ruta ya es una URL absoluta (http/https), la devuelve tal cual.
 * - Si ya contiene '/storage/', agrega solo el API_URL base.
 * - En cualquier otro caso, antepone API_URL + '/storage/'.
 *
 * @param {string} ruta - Ruta relativa o absoluta del archivo
 * @returns {string|null} URL completa o null si la ruta es nula
 */
export const resolverRutaArchivo = (ruta) => {
    if (!ruta) return null;
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;

    const rutaNormalizada = ruta.replace(/^\/?/, '');

    if (rutaNormalizada.includes('/storage/')) {
        return `${API_URL}/${rutaNormalizada}`;
    }

    return `${API_URL}/storage/${rutaNormalizada}`;
};

/**
 * Genera la URL de un avatar SVG anonimizado via DiceBear Avataaars.
 * La semilla es el nombre del usuario, lo que asegura consistencia:
 * el mismo usuario siempre obtiene el mismo avatar generado.
 *
 * @param {string} nombre - Semilla para la generacion del avatar
 * @returns {string} URL de la imagen SVG en DiceBear
 */
export const generarAvatarDicebear = (nombre = 'usuario') => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nombre)}`;
};

/**
 * Genera una imagen placeholder en base64 para cuando no hay portada real.
 * - Para canciones: icono de nota musical (corchea) sobre fondo oscuro
 * - Para colecciones/playlists/eventos: gradiente de azules basado en el titulo
 *
 * @param {string}  titulo    - Titulo del contenido (usado como semilla del gradiente)
 * @param {boolean} esCancion - true para mostrar corchea, false para gradiente
 * @returns {string} Data URI en base64 del SVG generado
 */
export const generarPortadaPlaceholder = (titulo = 'Portada', esCancion = false) => {
    if (esCancion) {
        return generarSVGCorchea();
    }
    return generarSVGGradiente(titulo);
};

/**
 * Genera un SVG con una corchea estilo Apple Music sobre fondo oscuro degradado.
 * Todos los elementos graficos (cabeza, tallo, bandera) usan el azul de marca.
 *
 * @returns {string} Data URI base64 del SVG
 */
const generarSVGCorchea = () => {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
        <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#0f0f1e;stop-opacity:1" />
            </linearGradient>
        </defs>

        <!-- Fondo oscuro degradado -->
        <rect width="300" height="300" fill="url(#bgGradient)"/>

        <!-- Circulo decorativo alrededor de la nota -->
        <circle cx="150" cy="150" r="100" fill="none" stroke="#0ADAF5" stroke-width="1" opacity="0.3"/>

        <!-- Cabeza de la nota musical -->
        <ellipse cx="100" cy="220" rx="32" ry="36" fill="#0ADAF5" opacity="1"/>
        <!-- Brillo sobre la cabeza -->
        <ellipse cx="92" cy="210" rx="18" ry="20" fill="#FFFFFF" opacity="0.35"/>

        <!-- Tallo vertical de la nota -->
        <rect x="128" y="30" width="14" height="195" fill="#0ADAF5" opacity="1" rx="7"/>
        <!-- Brillo sobre el tallo -->
        <rect x="130" y="35" width="6" height="180" fill="#FFFFFF" opacity="0.2" rx="3"/>

        <!-- Bandera de la corchea -->
        <path d="M 142 30 Q 210 20 220 90 Q 215 45 142 50 Z" fill="#0ADAF5" opacity="1"/>
        <!-- Brillo sobre la bandera -->
        <path d="M 145 32 Q 200 25 215 75 Q 212 48 145 53 Z" fill="#FFFFFF" opacity="0.2"/>

        <!-- Sombra en la base de la nota -->
        <ellipse cx="100" cy="260" rx="35" ry="10" fill="#000000" opacity="0.3"/>
    </svg>
    `;

    return 'data:image/svg+xml;base64,' + btoa(svg);
};

/**
 * Genera un SVG con gradiente diagonal de tres tonos de azul.
 * El punto de inicio del gradiente se determina a partir del hash del titulo,
 * garantizando que el mismo titulo produzca siempre el mismo gradiente.
 *
 * @param {string} titulo - Texto de la portada (se incluye en el SVG de forma semitransparente)
 * @returns {string} Data URI base64 del SVG
 */
const generarSVGGradiente = (titulo = 'Portada') => {
    const indices = obtenerIndicesColores(titulo, 3);
    const color1 = PALETA_AZULES[indices[0]];
    const color2 = PALETA_AZULES[indices[1]];
    const color3 = PALETA_AZULES[indices[2]];

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
        <!-- Titulo semitransparente como marca de agua -->
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle" opacity="0.3">
            ${titulo.substring(0, 20)}
        </text>
    </svg>
    `;

    return 'data:image/svg+xml;base64,' + btoa(svg);
};

/**
 * Calcula tres indices de la paleta de azules basandose en el hash del titulo.
 * Los indices estan espaciados 5 posiciones entre si (oscuro -> medio -> claro),
 * asegurando un gradiente ascendente coherente.
 *
 * @param {string} str     - Cadena de la que derivar el hash
 * @param {number} cantidad - Numero de indices a generar (siempre 3)
 * @returns {number[]} Array de tres indices validos dentro de PALETA_AZULES
 */
const obtenerIndicesColores = (str = '', cantidad = 3) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const maxStart = Math.max(0, PALETA_AZULES.length - 6);
    const startIndex = Math.abs(hash) % (maxStart + 1);

    return [
        startIndex,
        Math.min(startIndex + 5, PALETA_AZULES.length - 1),
        Math.min(startIndex + 10, PALETA_AZULES.length - 1)
    ];
};

/**
 * Genera dos colores (primario y secundario) en formato HSL a partir de un string.
 * Mantenida por compatibilidad con codigo antiguo; ya no se usa para gradientes.
 *
 * @param {string} str - Cadena de la que derivar los colores
 * @returns {{ primary: string, secondary: string }} Colores en formato HSL
 */
export const generarColoresDesdeString = (str = '') => {
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
