import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';
import API_URL from '../../config/api.js';
import { contextoMusica } from '../../contexts/ProveedorMusica.jsx';
import { tieneSesion } from '../../utils/sesion.js';
import './ReproductorDetalles.css';

const URL_STORAGE = `${API_URL}/storage/`;
const THROTTLE_TIME = 500; // Throttle timeupdate to 500ms intervals

const ReproductorDetallesComponent = ({ cancion, onTimeChange, seekTime, onPlay }) => {
    const { trackActual, setTrackActual, setIsPlaying: setGlobalIsPlaying } = useContext(contextoMusica);
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [error, setError] = useState(null);
    const pendingSeekRef = useRef(null);
    const lastUpdateRef = useRef(0); // For throttling timeupdate events

    // Obtener la URL correcta del audio
    const getAudioUrl = useCallback(() => {
        if (!cancion) return null;

        let filename = cancion.ubicacion
            || cancion.url
            || cancion.audio_url
            || cancion.ruta_audio
            || cancion.archivo
            || cancion.audio;

        if (!filename) {
            return null;
        }

        // Si ya es una URL completa, usarla directamente
        if (filename.startsWith('http://') || filename.startsWith('https://')) {
            return filename;
        }

        // Construir URL desde storage (audios/filename.mp3 → /storage/audios/filename.mp3)
        const rutaLimpia = filename.startsWith('/') ? filename.substring(1) : filename;
        const url = `${URL_STORAGE}${rutaLimpia}`;

        return url;
    }, [cancion]);

    // Buscar a un tiempo específico
    const performSeek = useCallback((timeToSeek) => {
        if (!audioRef.current) {
            pendingSeekRef.current = timeToSeek;
            return;
        }

        audioRef.current.currentTime = timeToSeek;
        setCurrentTime(timeToSeek);

        // Reproducir automáticamente cuando se salta
        if (audioRef.current.paused) {
            audioRef.current.play().catch(e => {
                // Auto-play failed, likely due to browser policy
            });
        }
    }, []);

    // Cuando hay un seekTime nuevo, buscar a ese tiempo
    useEffect(() => {
        if (seekTime !== undefined && seekTime !== null) {
            // Pequeño delay para asegurar que el audio está listo
            const timer = setTimeout(() => {
                performSeek(seekTime);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [seekTime, performSeek]);

    // Cuando el audio está listo, aplicar cualquier seek pendiente
    const applyPendingSeek = useCallback(() => {
        if (pendingSeekRef.current !== null) {
            performSeek(pendingSeekRef.current);
            pendingSeekRef.current = null;
        }
    }, [performSeek]);

    // URL del audio derivada de la canción (string primitivo). Solo cambia cuando
    // cambia el archivo real, NO cuando cambia la referencia del objeto `cancion`.
    const audioUrl = getAudioUrl();

    // Cargar la canción.
    // Depende SOLO de `audioUrl` (string), no del objeto `cancion` ni de `volume`.
    // Antes dependía de [cancion, getAudioUrl]: cuando Mostrar.jsx revalidaba los
    // datos (stale-while-revalidate) y `cancion` cambiaba de referencia manteniendo
    // el mismo archivo, este efecto se re-ejecutaba, su cleanup hacía audio.pause()
    // y reasignaba el src, deteniendo la reproducción a los pocos segundos.
    // Dependiendo de la URL primitiva, eso ya no ocurre.
    useEffect(() => {
        if (!audioRef.current) return;

        if (!audioUrl) {
            setError('No se encontró archivo de audio');
            return;
        }

        const audio = audioRef.current;
        audio.src = audioUrl;

        return () => {
            audio.pause();
        };
    }, [audioUrl]);

    // Sincroniza el volumen del elemento <audio> con el estado SIN tocar el src.
    // Se ejecuta al montar (volumen inicial) y cada vez que cambia `volume`,
    // por lo que ajustar el volumen ya no interrumpe la reproducción.
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Exclusión mutua con el reproductor global.
    // Cuando el global arranca una canción (trackActual deja de ser null), pausamos
    // el reproductor de detalles para que NO suenen los dos a la vez.
    // (El sentido contrario ya está cubierto en togglePlay, que hace setTrackActual(null)
    // al reproducir desde detalles, deteniendo el global.)
    useEffect(() => {
        if (trackActual && audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
        }
    }, [trackActual]);

    // Setup event listeners
    useEffect(() => {
        if (!audioRef.current) return;

        const audio = audioRef.current;

        const handlePlay = () => {
            setIsPlaying(true);
            if (onPlay) {
                onPlay();
            }
        };
        const handlePause = () => setIsPlaying(false);
        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            // Throttle onTimeChange callback to avoid excessive parent re-renders
            const now = Date.now();
            if (now - lastUpdateRef.current >= THROTTLE_TIME) {
                lastUpdateRef.current = now;
                if (onTimeChange) onTimeChange(audio.currentTime);
            }
        };
        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setError(null);
            applyPendingSeek();
        };
        const handleCanPlayThrough = () => {
            // Audio ready to play through
        };
        const handleError = (e) => {
            console.error('Error cargando audio:', e);
            setError('Error al cargar el audio');
        };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('canplaythrough', handleCanPlayThrough);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('canplaythrough', handleCanPlayThrough);
            audio.removeEventListener('error', handleError);
        };
    }, [onTimeChange]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            // Pausar el reproductor global cuando se reproduce desde detalles
            setGlobalIsPlaying(false);
            setTrackActual(null);

            audioRef.current.play().catch(e => {
                console.error('Error al reproducir:', e);
                setError('No se pudo reproducir');
            });
        }
    };

    const handleScrub = (e) => {
        const newTime = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const handleVolume = (e) => {
        const newVolume = parseFloat(e.target.value);
        // Solo actualizamos el estado: el useEffect de volumen lo aplica al
        // elemento <audio> sin recargar el src ni interrumpir la reproducción.
        setVolume(newVolume);
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (!cancion) return null;

    const sesionIniciada = tieneSesion();

    // Si no hay sesión, mostrar mensaje
    if (!sesionIniciada) {
        return (
            <div className="reproductor-sin-sesion">
                <div className="mensaje-sesion">
                    <FaLock className="icono-candado" />
                    <p className="texto-principal">Inicia sesión para escuchar</p>
                    <p className="texto-secundario">Necesitas una cuenta para reproducir música</p>
                    <Link to="/registro" className="btn-iniciar-sesion">
                        Crear cuenta
                    </Link>
                    <Link to="/login" className="btn-login-sesion">
                        Iniciar sesión
                    </Link>
                </div>
            </div>
        );
    }

    if (error) return <div className="reproductor-error">{error}</div>;

    return (
        <>
            {/* Elemento <audio> real en el DOM */}
            <audio ref={audioRef} crossOrigin="anonymous" />

            <div className="reproductor-detalles">
            {/* Botón Play */}
            <button className="btn-play-reproductor" onClick={togglePlay} title={isPlaying ? 'Pausar' : 'Reproducir'}>
                {isPlaying ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                )}
            </button>

            {/* Tiempo actual */}
            <span className="tiempo-reproductor">{formatTime(currentTime)}</span>

            {/* Barra de progreso */}
            <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleScrub}
                className="barra-progreso-reproductor"
                style={{ '--value': `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />

            {/* Tiempo total */}
            <span className="tiempo-reproductor">{formatTime(duration)}</span>

            {/* Control de volumen */}
            <div className="control-volumen-reproductor">
                <svg viewBox="0 0 24 24" fill="currentColor" className="icono-volumen">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolume}
                    className="slider-volumen-reproductor"
                    style={{ '--value': `${volume * 100}%` }}
                />
            </div>
            </div>
        </>
    );
};

export default React.memo(ReproductorDetallesComponent);
