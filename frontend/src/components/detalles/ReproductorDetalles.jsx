import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import API_URL from '../../config/api.js';
import { contextoMusica } from '../../contexts/ProveedorMusica.jsx';
import './ReproductorDetalles.css';

const URL_STORAGE = `${API_URL}/storage/`;
const THROTTLE_TIME = 500; // Throttle timeupdate to 500ms intervals

const ReproductorDetallesComponent = ({ cancion, onTimeChange, seekTime, onPlay }) => {
    const { setTrackActual, setIsPlaying: setGlobalIsPlaying } = useContext(contextoMusica);
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

    // Cargar la canción
    useEffect(() => {
        if (!cancion) return;

        const audioUrl = getAudioUrl();

        if (!audioUrl) {
            setError('No se encontró archivo de audio');
            return;
        }

        // Limpiar anterior
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        // Crear nuevo audio
        const audio = new Audio();
        audio.volume = volume;
        audio.crossOrigin = "anonymous";

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

        audioRef.current = audio;
        audio.src = audioUrl;

        return () => {
            audio.pause();
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('canplaythrough', handleCanPlayThrough);
            audio.removeEventListener('error', handleError);
        };
    }, [cancion, onTimeChange]);

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
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (!cancion) return null;
    if (error) return <div className="reproductor-error">{error}</div>;

    return (
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
    );
};

export default React.memo(ReproductorDetallesComponent);
