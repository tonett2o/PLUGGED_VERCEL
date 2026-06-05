// Reproductor.jsx - Reproductor Global de Música
import React, { useEffect, useRef, useContext, useState } from 'react';
import { FaMusic } from 'react-icons/fa';
import API_URL from '../config/api.js';
import { contextoMusica } from '../contexts/ProveedorMusica.jsx';
import { generarPortadaPlaceholder } from '../utils/imagen.js';
import './Reproductor.css';

const URL_STORAGE = `${API_URL}/storage/`;

const Reproductor = () => {
    // ============================================
    // CONTEXTO Y ESTADOS
    // ============================================
    const { trackActual, setTrackActual, canciones, isPlaying, setIsPlaying } = useContext(contextoMusica);

    // Estados de reproducción
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isShuffling, setIsShuffling] = useState(false);
    const [repeatMode, setRepeatMode] = useState(0); // 0: no repeat, 1: repeat all, 2: repeat one
    const [reproducerVisible, setReproducerVisible] = useState(true);

    // Referencias
    const audioRef = useRef(null);
    const reproduccionesContadas = useRef(new Set());

    // ============================================
    // UTILIDADES
    // ============================================

    /**
     * Obtiene la ruta correcta de la portada
     */
    const obtenerRutaPortada = (campoPortada) => {
        if (!campoPortada) return generarPortadaPlaceholder('Canción', false);
        if (campoPortada.startsWith('http://') || campoPortada.startsWith('https://')) {
            return campoPortada;
        }
        return `${URL_STORAGE}${campoPortada.startsWith('/') ? campoPortada.substring(1) : campoPortada}`;
    };

    /**
     * Obtiene la URL del audio para reproducción
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

        // Limpiar URLs duplicadas
        urlFinal = urlFinal.replace('/storage//storage/', '/storage/');
        urlFinal = urlFinal.replace('/storage/storage/', '/storage/');

        return urlFinal;
    };

    /**
     * Formatea tiempo a MM:SS
     */
    const formatearTiempo = (tiempo) => {
        if (isNaN(tiempo)) return "0:00";
        const minutos = Math.floor(tiempo / 60);
        const segundos = Math.floor(tiempo % 60);
        return `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
    };

    /**
     * Obtiene el índice de la canción actual en la lista
     */
    const obtenerIndiceActual = () => {
        if (!canciones || !trackActual) return -1;
        return canciones.findIndex(c => c.id === trackActual.id);
    };

    // ============================================
    // LÓGICA DE REPRODUCCIÓN
    // ============================================

    // Setup event listeners del elemento audio
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

            // Contar reproducción a los 30 segundos (solo si hay sesión)
            const token = localStorage.getItem('token');
            if (trackActual && audio.currentTime >= 30 && !reproduccionesContadas.current.has(trackActual.id) && token) {
                reproduccionesContadas.current.add(trackActual.id);
                console.log('📊 Reproducción contada:', trackActual.titulo);

                fetch(`${API_URL}/api/canciones/${trackActual.id}/reproducir`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }).catch(e => console.error('❌ Error registrando reproducción:', e));
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

    // Detener audio cuando trackActual es null (cierre de sesión)
    useEffect(() => {
        if (!trackActual && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    }, [trackActual]);

    /**
     * Reproduce la siguiente canción según el modo activo
     */
    const reproducirSiguiente = () => {
        if (!canciones || canciones.length === 0) return;

        const indexActual = obtenerIndiceActual();

        // MODO: Repetir una canción
        if (repeatMode === 2) {
            console.log('🔁 Repetir canción:', trackActual.titulo);
            // Reiniciar la misma canción desde el inicio
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            }
            return;
        }

        let proximoIndex;

        // MODO: Aleatorio
        if (isShuffling) {
            // Seleccionar aleatoriamente sin repetir la misma canción
            let nuevoIndex;
            do {
                nuevoIndex = Math.floor(Math.random() * canciones.length);
            } while (nuevoIndex === indexActual && canciones.length > 1);
            proximoIndex = nuevoIndex;
            console.log('🔀 Modo aleatorio - próxima canción:', canciones[proximoIndex].titulo);
        } else {
            // MODO: Normal
            if (indexActual < canciones.length - 1) {
                proximoIndex = indexActual + 1;
            } else if (repeatMode === 1) {
                // Repetir desde el inicio
                proximoIndex = 0;
                console.log('🔁 Repetir todo - volviendo al inicio');
            } else {
                // Se acabó la lista, parar
                console.log('✋ Fin de la lista');
                setTrackActual(null);
                return;
            }
        }

        setTrackActual(canciones[proximoIndex]);
    };

    /**
     * Reproduce la canción anterior
     */
    const reproducirAnterior = () => {
        if (!canciones || canciones.length === 0) return;

        const indexActual = obtenerIndiceActual();

        if (indexActual > 0) {
            setTrackActual(canciones[indexActual - 1]);
        } else {
            // Si estamos al inicio, ir al final
            setTrackActual(canciones[canciones.length - 1]);
        }
    };

    /**
     * Toggle play/pause
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
    // MANEJO DE EVENTOS DE AUDIO
    // ============================================

    /**
     * Effect: Cargar y reproducir canción actual
     */
    useEffect(() => {
        if (!trackActual || !audioRef.current) return;

        const urlAudio = obtenerUrlAudio(trackActual.ubicacion);
        if (!urlAudio) {
            console.error('❌ No se encontró URL de audio para:', trackActual.titulo);
            return;
        }

        console.log('🎵 Reproduciendo:', trackActual.titulo);

        const audio = audioRef.current;

        // Cambiar URL del audio y resetear posición
        audio.src = urlAudio;
        audio.currentTime = 0;
        audio.volume = 0.5;

        // Auto-reproducir
        audio.play().catch((error) => {
            console.log("⚠️ Auto-play esperando interacción del usuario:", error.message);
        });

        return () => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        };
    }, [trackActual]);

    /**
     * Effect: Limpiar reproducciones contadas
     */
    useEffect(() => {
        return () => {
            if (trackActual) {
                reproduccionesContadas.current.delete(trackActual.id);
            }
        };
    }, [trackActual?.id]);

    // ============================================
    // HANDLERS DE ENTRADA
    // ============================================

    const handleScrubbar = (e) => {
        const nuevoTiempo = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = nuevoTiempo;
            setCurrentTime(nuevoTiempo);
        }
    };

    const handleVolumen = (e) => {
        const nuevoVolumen = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.volume = nuevoVolumen;
        }
    };

    // ============================================
    // RENDERIZADO
    // ============================================

    // No mostrar nada si no hay canción
    if (!trackActual) {
        return null;
    }

    // Pestaña minimizada
    if (!reproducerVisible) {
        return (
            <div className="reproductor-pestaña" onClick={() => setReproducerVisible(true)} title="Click para expandir reproductor">
                <FaMusic size={24} />
            </div>
        );
    }

    return (
        <>
            {/* Elemento <audio> real en el DOM para reproducción */}
            <audio ref={audioRef} crossOrigin="anonymous" />

            <div className="footer-player">
                {/* SECCIÓN IZQUIERDA: Portada y Artista */}
            <div className="seccion-izquierda">
                <img
                    src={obtenerRutaPortada(trackActual?.portada)}
                    alt=""
                    onError={(e) => (e.target.src = generarPortadaPlaceholder(trackActual?.titulo || 'Canción', false))}
                />
                <div className="artista-info">
                    <p className="titulo-reproductor">{trackActual?.titulo || 'Canción'}</p>
                    <p className="artista-texto">
                        {trackActual?.coleccion?.titulo ? `${trackActual.coleccion.titulo} • ` : ''}
                        {trackActual?.usuario?.nombre || trackActual?.artista || 'Artista Desconocido'}
                    </p>
                </div>
            </div>

            {/* SECCIÓN CENTRO: Controles y Barra de Progreso */}
            <div className="seccion-centro">
                {/* Barra de Progreso */}
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

                {/* Botones de Control */}
                <div className="controles-centro">
                    {/* Botón Aleatorio */}
                    <button
                        onClick={() => setIsShuffling(!isShuffling)}
                        className={`btn-control ${isShuffling ? 'activo' : ''}`}
                        title={isShuffling ? 'Desactivar aleatorio' : 'Activar aleatorio'}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                            <polyline points="16 3 20 7 16 11"></polyline>
                            <path d="M4 20h9M20 4h-7.5a4 4 0 0 0-4 4m.5 9.5H20"></path>
                        </svg>
                    </button>

                    {/* Botón Anterior */}
                    <button onClick={reproducirAnterior} className="btn-control" title="Anterior">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                    </button>

                    {/* Botón Play/Pausa */}
                    <button onClick={alternarReproduccion} className="btn-play" title={isPlaying ? 'Pausar' : 'Reproducir'}>
                        {isPlaying ? (
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>
                        )}
                    </button>

                    {/* Botón Siguiente */}
                    <button onClick={reproducirSiguiente} className="btn-control" title="Siguiente">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                    </button>

                    {/* Botón Repetir */}
                    <button
                        onClick={() => setRepeatMode((repeatMode + 1) % 3)}
                        className={`btn-control ${repeatMode > 0 ? 'activo' : ''}`}
                        title={repeatMode === 0 ? 'Sin repetir' : repeatMode === 1 ? 'Repetir todo' : 'Repetir una'}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                            <polyline points="17 2 21 6 17 10"></polyline>
                            <path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22v1a4 4 0 0 1-4-4H3"></path>
                        </svg>
                        {repeatMode === 2 && <span className="repeat-badge">1</span>}
                    </button>
                </div>
            </div>

            {/* SECCIÓN DERECHA: Volumen y Minimizar */}
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
