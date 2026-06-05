/**
 * Reproductor.jsx - Reproductor global de audio
 *
 * Barra fija en la parte inferior de la pantalla que reproduce las canciones
 * seleccionadas en cualquier parte de la aplicacion. Solo se monta si hay
 * un usuario autenticado (condicion en AppContent).
 *
 * Estructura visual de tres zonas:
 *   - Izquierda: portada pequena + titulo + artista/coleccion
 *   - Centro: barra de progreso scrubable + controles (anterior, play/pausa, siguiente, shuffle, repeat)
 *   - Derecha: slider de volumen + boton de minimizar
 *
 * Modos de reproduccion (repeatMode):
 *   0 - Sin repeticion: para al acabar la lista
 *   1 - Repetir todo: vuelve al inicio al acabar la lista
 *   2 - Repetir una: repite la cancion actual indefinidamente
 *
 * Conteo de reproducciones:
 *   Registra una reproduccion en el backend cuando el usuario lleva
 *   30 segundos escuchando la cancion. Cada cancion se cuenta una sola
 *   vez por sesion de reproduccion (Set de ids ya contados).
 *
 * El componente puede minimizarse a una pestana flotante y expandirse
 * de nuevo con un clic.
 */
import React, { useEffect, useRef, useContext, useState } from 'react';
import { FaMusic, FaRandom, FaRedo } from 'react-icons/fa';
import API_URL from '../config/api.js';
import { contextoMusica } from '../contexts/ProveedorMusica.jsx';
import { generarPortadaPlaceholder } from '../utils/imagen.js';
import './Reproductor.css';

const URL_STORAGE = `${API_URL}/storage/`;

const Reproductor = () => {
    const { trackActual, setTrackActual, canciones, isPlaying, setIsPlaying } = useContext(contextoMusica);

    // Posicion y duracion del audio
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Modo aleatorio
    const [isShuffling, setIsShuffling] = useState(false);

    // Modo de repeticion: 0 = sin repetir, 1 = repetir todo, 2 = repetir una
    const [repeatMode, setRepeatMode] = useState(0);

    // Visibilidad del reproductor (true = expandido, false = minimizado)
    const [reproducerVisible, setReproducerVisible] = useState(true);

    // Elemento <audio> del DOM
    const audioRef = useRef(null);

    // Set de IDs de canciones ya contadas en esta sesion para evitar duplicados
    const reproduccionesContadas = useRef(new Set());

    // ============================================
    // UTILIDADES
    // ============================================

    /**
     * Construye la URL completa de la portada de una cancion.
     * Si no hay portada, genera un SVG placeholder.
     *
     * @param {string} campoPortada - Ruta de la portada (relativa o absoluta)
     * @returns {string} URL usable en un elemento <img>
     */
    const obtenerRutaPortada = (campoPortada) => {
        if (!campoPortada) return generarPortadaPlaceholder('Cancion', false);
        if (campoPortada.startsWith('http://') || campoPortada.startsWith('https://')) {
            return campoPortada;
        }
        return `${URL_STORAGE}${campoPortada.startsWith('/') ? campoPortada.substring(1) : campoPortada}`;
    };

    /**
     * Construye la URL de audio para el elemento <audio>.
     * Normaliza rutas duplicadas (/storage//storage/) que pueden generarse
     * si el campo ubicacion ya incluye el prefijo storage.
     *
     * @param {string} ubicacion - Campo ubicacion de la cancion
     * @returns {string|null} URL del audio o null si no hay ubicacion
     */
    const obtenerUrlAudio = (ubicacion) => {
        if (!ubicacion) return null;

        let urlFinal = ubicacion;
        if (!urlFinal.startsWith('http://') && !urlFinal.startsWith('https://')) {
            const rutaLimpia = urlFinal.startsWith('/') ? urlFinal.substring(1) : urlFinal;
            if (rutaLimpia.startsWith('storage/')) {
                urlFinal = `${API_URL}/${rutaLimpia}`;
            } else {
                urlFinal = `${URL_STORAGE}${rutaLimpia}`;
            }
        }

        // Limpiar duplicacion de /storage/ que puede ocurrir en algunos registros
        urlFinal = urlFinal.replace('/storage//storage/', '/storage/');
        urlFinal = urlFinal.replace('/storage/storage/', '/storage/');

        return urlFinal;
    };

    /**
     * Convierte segundos a formato MM:SS legible.
     * @param {number} tiempo - Tiempo en segundos
     * @returns {string} Tiempo formateado (ej: "3:45")
     */
    const formatearTiempo = (tiempo) => {
        if (isNaN(tiempo)) return "0:00";
        const minutos = Math.floor(tiempo / 60);
        const segundos = Math.floor(tiempo % 60);
        return `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
    };

    /**
     * Obtiene el indice de la cancion actual dentro del array global de canciones.
     * @returns {number} Indice o -1 si no hay cancion activa
     */
    const obtenerIndiceActual = () => {
        if (!canciones || !trackActual) return -1;
        return canciones.findIndex(c => c.id === trackActual.id);
    };

    // ============================================
    // LISTENERS DEL ELEMENTO AUDIO
    // ============================================

    /**
     * Registra los event listeners del elemento <audio> al montar o cambiar de cancion.
     * Incluye la logica de conteo de reproducciones al superar los 30 segundos.
     */
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        const handleEnded = () => {
            reproducirSiguiente();
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);

            // Registrar reproduccion en el backend al superar 30 segundos
            const token = localStorage.getItem('token');
            if (
                trackActual &&
                audio.currentTime >= 30 &&
                !reproduccionesContadas.current.has(trackActual.id) &&
                token
            ) {
                reproduccionesContadas.current.add(trackActual.id);

                fetch(`${API_URL}/api/canciones/${trackActual.id}/reproducir`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }).catch(e => console.error('Error registrando reproduccion:', e));
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, [trackActual]);

    /**
     * Detiene el audio cuando se cierra la sesion (trackActual pasa a null).
     */
    useEffect(() => {
        if (!trackActual && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    }, [trackActual]);

    // ============================================
    // LOGICA DE NAVEGACION ENTRE CANCIONES
    // ============================================

    /**
     * Avanza a la siguiente cancion segun el modo activo:
     *   repeatMode 2 - Repite la misma cancion desde el inicio
     *   isShuffling  - Selecciona una cancion aleatoria diferente a la actual
     *   repeatMode 1 - Al llegar al final, vuelve al inicio de la lista
     *   Por defecto  - Avanza linealmente; para al llegar al final
     */
    const reproducirSiguiente = () => {
        if (!canciones || canciones.length === 0) return;

        const indexActual = obtenerIndiceActual();

        if (repeatMode === 2) {
            // Repetir la cancion actual desde el principio
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            }
            return;
        }

        let proximoIndex;

        if (isShuffling) {
            // Seleccionar un indice aleatorio distinto al actual
            let nuevoIndex;
            do {
                nuevoIndex = Math.floor(Math.random() * canciones.length);
            } while (nuevoIndex === indexActual && canciones.length > 1);
            proximoIndex = nuevoIndex;
        } else {
            if (indexActual < canciones.length - 1) {
                proximoIndex = indexActual + 1;
            } else if (repeatMode === 1) {
                // Volver al inicio de la lista
                proximoIndex = 0;
            } else {
                // Fin de la lista sin repeticion
                setTrackActual(null);
                return;
            }
        }

        setTrackActual(canciones[proximoIndex]);
    };

    /**
     * Retrocede a la cancion anterior.
     * Si ya estamos en la primera cancion, va a la ultima.
     */
    const reproducirAnterior = () => {
        if (!canciones || canciones.length === 0) return;

        const indexActual = obtenerIndiceActual();

        if (indexActual > 0) {
            setTrackActual(canciones[indexActual - 1]);
        } else {
            setTrackActual(canciones[canciones.length - 1]);
        }
    };

    /**
     * Alterna entre reproducir y pausar el audio actual.
     */
    const alternarReproduccion = () => {
        if (!audioRef.current) return;

        if (audioRef.current.paused) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    };

    // ============================================
    // EFECTO: CARGAR Y REPRODUCIR CANCION
    // ============================================

    /**
     * Al cambiar trackActual, carga el audio, lo posiciona al inicio
     * y lo reproduce automaticamente. Pausa el audio anterior al limpiar.
     */
    useEffect(() => {
        if (!trackActual || !audioRef.current) return;

        const urlAudio = obtenerUrlAudio(trackActual.ubicacion);
        if (!urlAudio) {
            console.error('No se encontro URL de audio para:', trackActual.titulo);
            return;
        }

        const audio = audioRef.current;
        audio.src = urlAudio;
        audio.currentTime = 0;
        audio.volume = 0.5;

        audio.play().catch((error) => {
            // El navegador puede bloquear el autoplay sin interaccion previa del usuario
            console.log("Auto-play esperando interaccion del usuario:", error.message);
        });

        return () => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        };
    }, [trackActual]);

    /**
     * Limpia el id de la cancion del set de reproducciones contadas
     * cuando se cambia de cancion, para que pueda volver a contarse
     * si se reproduce de nuevo.
     */
    useEffect(() => {
        return () => {
            if (trackActual) {
                reproduccionesContadas.current.delete(trackActual.id);
            }
        };
    }, [trackActual?.id]);

    // ============================================
    // HANDLERS DE CONTROLES
    // ============================================

    /**
     * Actualiza la posicion de reproduccion al mover la barra de progreso.
     */
    const handleScrubbar = (e) => {
        const nuevoTiempo = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = nuevoTiempo;
            setCurrentTime(nuevoTiempo);
        }
    };

    /**
     * Actualiza el volumen del audio al mover el slider de volumen.
     */
    const handleVolumen = (e) => {
        const nuevoVolumen = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.volume = nuevoVolumen;
        }
    };

    // ============================================
    // RENDERIZADO
    // ============================================

    // No mostrar el reproductor si no hay cancion seleccionada
    if (!trackActual) {
        return null;
    }

    // Estado minimizado: solo un icono flotante que expande al hacer clic
    if (!reproducerVisible) {
        return (
            <div
                className="reproductor-pestana"
                onClick={() => setReproducerVisible(true)}
                title="Click para expandir reproductor"
            >
                <FaMusic size={24} />
            </div>
        );
    }

    return (
        <>
            {/* Elemento audio real del navegador, sin controles nativos */}
            <audio ref={audioRef} crossOrigin="anonymous" />

            <div className="footer-player">
                {/* Zona izquierda: portada + info de la cancion */}
                <div className="seccion-izquierda">
                    <img
                        src={obtenerRutaPortada(trackActual?.portada)}
                        alt=""
                        onError={(e) => (e.target.src = generarPortadaPlaceholder(trackActual?.titulo || 'Cancion', false))}
                    />
                    <div className="artista-info">
                        <p className="titulo-reproductor">{trackActual?.titulo || 'Cancion'}</p>
                        <p className="artista-texto">
                            {trackActual?.coleccion?.titulo ? `${trackActual.coleccion.titulo} • ` : ''}
                            {trackActual?.usuario?.nombre || trackActual?.artista || 'Artista Desconocido'}
                        </p>
                    </div>
                </div>

                {/* Zona central: barra de progreso + controles de reproduccion */}
                <div className="seccion-centro">
                    {/* Barra de progreso con tiempo actual y duracion total */}
                    <div className="ondas-contenedor">
                        <span style={{ color: '#b3b3b3', fontSize: '12px' }}>{formatearTiempo(currentTime)}</span>
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleScrubbar}
                            style={{
                                flex: 1,
                                accentColor: '#0ADAF5',
                                cursor: 'pointer',
                                height: '4px'
                            }}
                        />
                        <span style={{ color: '#b3b3b3', fontSize: '12px' }}>{formatearTiempo(duration)}</span>
                    </div>

                    {/* Botones de control */}
                    <div className="controles-centro">
                        {/* Aleatorio */}
                        <button
                            onClick={() => setIsShuffling(!isShuffling)}
                            className={`btn-control ${isShuffling ? 'activo' : ''}`}
                            title={isShuffling ? 'Desactivar aleatorio' : 'Activar aleatorio'}
                        >
                            <FaRandom size={18} />
                        </button>

                        {/* Anterior */}
                        <button onClick={reproducirAnterior} className="btn-control" title="Anterior">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                        </button>

                        {/* Play / Pausa */}
                        <button onClick={alternarReproduccion} className="btn-play" title={isPlaying ? 'Pausar' : 'Reproducir'}>
                            {isPlaying ? (
                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>
                            )}
                        </button>

                        {/* Siguiente */}
                        <button onClick={reproducirSiguiente} className="btn-control" title="Siguiente">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                        </button>

                        {/* Repetir: cicla entre sin repeticion / repetir todo / repetir una */}
                        <button
                            onClick={() => setRepeatMode((repeatMode + 1) % 3)}
                            className={`btn-control ${repeatMode > 0 ? 'activo' : ''}`}
                            title={repeatMode === 0 ? 'Sin repetir' : repeatMode === 1 ? 'Repetir todo' : 'Repetir una'}
                        >
                            <FaRedo size={18} />
                            {/* Badge "1" para indicar modo repetir-una */}
                            {repeatMode === 2 && <span className="repeat-badge">1</span>}
                        </button>
                    </div>
                </div>

                {/* Zona derecha: volumen + minimizar */}
                <div className="seccion-derecha">
                    <div className="controles-volumen">
                        <svg viewBox="0 0 24 24" fill="#b3b3b3" width="20" height="20">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            defaultValue="0.5"
                            onChange={handleVolumen}
                            className="slider-volumen"
                        />
                    </div>
                    <button
                        onClick={() => setReproducerVisible(false)}
                        className="btn-minimizar"
                        title="Minimizar reproductor"
                    >
                        <FaMusic size={20} />
                    </button>
                </div>
            </div>
        </>
    );
};

export default Reproductor;
