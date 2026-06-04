import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlay, FaPause, FaTimes } from "react-icons/fa";
import useApiPut from "../../hooks/Cancion/UseApiPut.js";
import { contextoMusica } from "../../contexts/ProveedorMusica.jsx";
import { contextoNotificaciones } from "../../contexts/ProveedorNotificaciones.jsx";
import { useAuth } from "../../contexts/ProveedorAuth.jsx";
import { generarPortadaPlaceholder } from "../../utils/imagen.js";
import PortadaPorDefecto from "../../assets/portada-default.jpg";
import "./DetallesPlaylist.css";

const URL_STORAGE = "http://localhost:8000/storage/";

const DetallesPlaylist = ({ playlistBuscada }) => {
    const { reproducirTrack, trackActual, isPlaying } = useContext(contextoMusica);
    const notificaciones = useContext(contextoNotificaciones);

    // Verificar si el usuario actual es el propietario de la playlist
    const { usuario: usuarioLogueado } = useAuth();
    const esMiPlaylist = usuarioLogueado && playlistBuscada?.usuario && usuarioLogueado.id === playlistBuscada.usuario.id;

    // Usar playlistBuscada directamente (ya viene cargada del backend con todas las canciones)
    const {
        titulo = 'Playlist sin nombre',
        artista,
        usuario,
        portada,
        descripcion,
        privacidad = 'publica',
        fecha_publicacion,
        canciones = []
    } = playlistBuscada || {};

    const [portadaFallo, setPortadaFallo] = useState(false);
    const [cancionesLocales, setCancionesLocales] = useState(null);
    const imagenPorDefecto = generarPortadaPlaceholder(titulo || 'Playlist', false);

    const resolverPortada = (img) => {
        if (!img) return PortadaPorDefecto;
        if (img.startsWith('http://') || img.startsWith('https://')) return img;
        return `${URL_STORAGE}${img.startsWith('/') ? img.substring(1) : img}`;
    };

    // Desasignar canción de playlist
    const desasignarCancion = async (track) => {
        try {
            const token = localStorage.getItem('token');
            const cancionActualizada = {
                ...track,
                id_playlist: null // Desasignar de la playlist
            };

            const respuesta = await useApiPut(track.id, cancionActualizada, token);

            if (respuesta && !respuesta.error) {
                // Actualizar lista local
                setCancionesLocales(prev => (prev || canciones).filter(c => c.id !== track.id));
                notificaciones.exito(`"${track.titulo}" removida de la playlist`);
            } else if (respuesta?.status === 403) {
                notificaciones.error('No tienes permiso para remover canciones de esta playlist');
            } else {
                notificaciones.error(respuesta?.message || 'No se pudo remover la canción');
            }
        } catch (error) {
            console.error('Error desasignando canción:', error);
            notificaciones.error('Error al remover la canción');
        }
    };

    const cancionesActuales = cancionesLocales || canciones;
    const tracksDeLaPlaylist = Array.isArray(cancionesActuales) ? cancionesActuales : [];

    return (
        <div className="sc-collection-detail-page">
            {/* --- CABECERA DE LA PLAYLIST (Estructura idéntica a Colección) --- */}
            <div className="sc-collection-header">
                {/* PORTADA A LA IZQUIERDA CON BADGE */}
                <div className="sc-col-left">
                    <div className="sc-col-cover">
                        {!portadaFallo ? (
                            <img
                                src={resolverPortada(portada)}
                                alt={titulo}
                                onError={() => setPortadaFallo(true)}
                            />
                        ) : (
                            <div
                                className="sc-col-cover-fallback"
                                style={{
                                    backgroundImage: `url(${imagenPorDefecto})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    width: '100%',
                                    height: '100%'
                                }}
                            />
                        )}
                    </div>
                    <span className="sc-col-type-badge">{privacidad ? privacidad.toUpperCase() : 'PLAYLIST'}</span>
                </div>

                {/* CONTENIDO A LA DERECHA */}
                <div className="sc-col-right">
                    {/* SECCIÓN SUPERIOR: TÍTULO Y CREADOR */}
                    <div className="sc-col-top-section">
                        {/* TÍTULO (MORADO) */}
                        <h1 className="sc-col-title">{titulo || 'Playlist sin nombre'}</h1>

                        {/* CREADOR (VERDE) */}
                        <div className="sc-col-creator">
                            <span>De </span>
                            {usuario && (
                                <Link to={`/mostrar/usuario/${usuario.id}`} className="sc-col-artist-link">
                                    {usuario?.avatar && (
                                        <img
                                            src={usuario.avatar}
                                            alt={usuario?.nick || 'Usuario'}
                                            className="sc-col-artist-avatar"
                                            onError={(e) => (e.target.style.display = 'none')}
                                        />
                                    )}
                                    <strong>{usuario?.nick || usuario?.nombre || artista || 'Usuario'}</strong>
                                </Link>
                            )}
                            {!usuario && <strong>{artista || 'Usuario'}</strong>}
                        </div>
                    </div>

                    {/* DESCRIPCIÓN (AZUL) - CENTRO */}
                    <p className="sc-col-description">{descripcion || "Sin descripción disponible."}</p>

                    {/* FECHA (AMARILLA) - ABAJO */}
                    <div className="sc-col-meta">Año de creación: {fecha_publicacion}</div>
                </div>
            </div>

            {/* --- LISTADO DE CANCIONES DE ESTA PLAYLIST (Estructura idéntica a Colección) --- */}
            <div className="sc-collection-body">
                <h3 className="sc-body-title">Canciones incluidas ({tracksDeLaPlaylist.length})</h3>
                
                <div className="sc-tracks-table">
                    {tracksDeLaPlaylist.length > 0 ? (
                        tracksDeLaPlaylist.map((track, index) => {
                            // Comprobamos si esta canción exacta es la que está sonando ahora mismo
                            const estaReproduciendo = trackActual?.id === track.id && isPlaying;

                            return (
                                <div key={track.id} className={`sc-track-row ${estaReproduciendo ? 'sc-active-track' : ''}`}>
                                    <div className="sc-row-number">{index + 1}</div>
                                    
                                    <div className="sc-row-action">
                                        {/* Conectado al reproductor global con tus botones impositivos */}
                                        <button 
                                            className="sc-row-play-btn" 
                                            onClick={() => reproducirTrack(track)}
                                        >
                                            {estaReproduciendo ? '⏸' : '▶'}
                                        </button>
                                    </div>

                                    <div className="sc-row-meta-info">
                                        <span className="sc-row-title">{track.titulo}</span>
                                        {/* Mostramos el creador/artista real de este track específico de la playlist */}
                                        <span className="sc-row-artist">{track.artista || 'Artista Desconocido'}</span>
                                    </div>

                                    <div className="sc-row-details">
                                        <span className="sc-row-bpm">{track.bpm ? `${track.bpm} BPM` : '-- BPM'}</span>
                                        <span className="sc-row-key">{track.tonalidad || '--'}</span>
                                    </div>

                                    {esMiPlaylist && (
                                        <button
                                            className="sc-row-remove-btn"
                                            onClick={() => desasignarCancion(track)}
                                            title="Remover de la playlist"
                                        >
                                            <FaTimes />
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p className="sc-empty-tracks">Esta playlist aún no tiene canciones asignadas.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetallesPlaylist;