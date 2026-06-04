import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaTimes } from "react-icons/fa";
import API_URL from "../../config/api.js";
import useApiPut from "../../hooks/Cancion/useApiPut.js";
// 1. Conectamos con el grifo global de la música
import { contextoMusica } from "../../contexts/ProveedorMusica.jsx";
import { contextoNotificaciones } from "../../contexts/ProveedorNotificaciones.jsx";
import { useAuth } from "../../contexts/ProveedorAuth.jsx";
import { generarPortadaPlaceholder } from "../../utils/imagen.js";
import PortadaPorDefecto from "../../assets/portada-default.jpg";
import "./DetallesColeccion.css"; // Asegúrate de enlazar sus estilos

const URL_STORAGE = `${API_URL}/storage/`;

const DetallesColeccion = ({ coleccionBuscada }) => {
    // Si por algún motivo se recarga la ruta directamente y tarda en llegar la prop
    if (!coleccionBuscada) return <p>Cargando información del álbum...</p>;

    const { id, titulo, artista, usuario, portada, descripcion, tipo, fecha_publicacion, colaboradores = [] } = coleccionBuscada;

    const [avataresFallidos, setAvataresFallidos] = useState({});
    const [portadaFallo, setPortadaFallo] = useState(false);
    const [cancionesLocales, setCancionesLocales] = useState(null);
    const imagenPorDefecto = generarPortadaPlaceholder(titulo || 'Colección', false);

    // 2. 🛠️ EXTRAEMOS LA REACTIVIDAD: Traemos todas las canciones de la app y los controles del reproductor
    const { canciones, reproducirTrack, trackActual, isPlaying } = useContext(contextoMusica);
    const notificaciones = useContext(contextoNotificaciones);

    // Verificar si el usuario actual es el propietario de la colección
    const { usuario: usuarioLogueado } = useAuth();
    const esMiColeccion = usuarioLogueado && usuario && usuarioLogueado.id === usuario.id;

    // Desasignar canción de colección
    const desasignarCancion = async (track) => {
        try {
            const token = localStorage.getItem('token');
            const cancionActualizada = {
                ...track,
                id_coleccion: null // Desasignar de la colección
            };

            const respuesta = await useApiPut(track.id, cancionActualizada, token);

            if (respuesta && !respuesta.error) {
                // Actualizar lista local
                setCancionesLocales(prev => (prev || canciones).filter(c => c.id !== track.id));
                notificaciones.exito(`"${track.titulo}" removida de la colección`);
            } else if (respuesta?.status === 403) {
                notificaciones.error('No tienes permiso para remover canciones de esta colección');
            } else {
                notificaciones.error(respuesta?.message || 'No se pudo remover la canción');
            }
        } catch (error) {
            console.error('Error desasignando canción:', error);
            notificaciones.error('Error al remover la canción');
        }
    };

    // 3. 🛠️ FILTRADO: Sacamos únicamente las canciones que llevan el ID de esta colección
    const cancionesActuales = cancionesLocales || canciones;
    const tracksDeLaColeccion = cancionesActuales.filter(track => track.id_coleccion === id);

    // Función auxiliar para evitar URLs rotas de portadas
    const obtenerRutaPortada = (campoPortada) => {
        if (!campoPortada) return PortadaPorDefecto;
        if (campoPortada.startsWith('http://') || campoPortada.startsWith('https://')) {
            return campoPortada;
        }
        return `${URL_STORAGE}${campoPortada}`;
    };

    return (
        <div className="sc-collection-detail-page">
            {/* --- CABECERA DE LA COLECCIÓN (Álbum / Singles / EP) --- */}
            <div className="sc-collection-header">
                {/* PORTADA A LA IZQUIERDA CON BADGE */}
                <div className="sc-col-left">
                    <div className="sc-col-cover">
                        {!portadaFallo ? (
                            <img
                                src={obtenerRutaPortada(portada)}
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
                    <span className="sc-col-type-badge">{tipo ? tipo.toUpperCase() : 'COLECCIÓN'}</span>
                </div>

                {/* CONTENIDO A LA DERECHA */}
                <div className="sc-col-right">
                    {/* SECCIÓN SUPERIOR: TÍTULO Y CREADOR */}
                    <div className="sc-col-top-section">
                        {/* TÍTULO (MORADO) */}
                        <h1 className="sc-col-title">{titulo}</h1>

                        {/* CREADOR Y COLABORADORES EN UNA FILA (VERDE Y ROJO) */}
                        <div className="sc-col-creator-collab-row">
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
                                        <strong>{usuario?.nick || usuario?.nombre || artista}</strong>
                                    </Link>
                                )}
                                {!usuario && <strong>{artista}</strong>}
                            </div>

                            {/* COLABORADORES (ROJO) */}
                            {colaboradores && colaboradores.length > 0 && (
                                <div className="sc-col-colaboradores-inline">
                                    {colaboradores.map((colab) => (
                                        <Link key={colab.id} to={`/mostrar/usuario/${colab.id}`} className="sc-col-colaborador-item">
                                            {!avataresFallidos[colab.id] && colab.avatar ? (
                                                <img
                                                    src={colab.avatar}
                                                    alt={colab.nick}
                                                    className="sc-col-colab-avatar"
                                                    onError={() => setAvataresFallidos(prev => ({...prev, [colab.id]: true}))}
                                                />
                                            ) : (
                                                <FaUser className="sc-col-colab-avatar-icon" />
                                            )}
                                            <span>{colab.nick || colab.nombre}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DESCRIPCIÓN (AZUL) - CENTRO */}
                    <p className="sc-col-description">{descripcion || "Sin descripción disponible."}</p>

                    {/* FECHA (AMARILLA) - ABAJO */}
                    <div className="sc-col-meta">Año de publicación: {fecha_publicacion}</div>
                </div>
            </div>

            {/* --- LISTADO DE CANCIONES DE ESTA COLECCIÓN --- */}
            <div className="sc-collection-body">
                <h3 className="sc-body-title">Canciones incluidas ({tracksDeLaColeccion.length})</h3>
                
                <div className="sc-tracks-table">
                    {tracksDeLaColeccion.length > 0 ? (
                        tracksDeLaColeccion.map((track, index) => {
                            // Comprobamos si esta canción exacta es la que está sonando ahora mismo
                            const estaReproduciendo = trackActual?.id === track.id && isPlaying;

                            return (
                                <div key={track.id} className={`sc-track-row ${estaReproduciendo ? 'sc-active-track' : ''}`}>
                                    <div className="sc-row-number">{index + 1}</div>
                                    
                                    <div className="sc-row-action">
                                        {/* 🛠️ CONECTADO AL REPRODUCTOR GLOBAL */}
                                        <button 
                                            className="sc-row-play-btn" 
                                            onClick={() => reproducirTrack(track)}
                                        >
                                            {estaReproduciendo ? '⏸' : '▶'}
                                        </button>
                                    </div>

                                    <div className="sc-row-meta-info">
                                        <span className="sc-row-title">{track.titulo}</span>
                                        <span className="sc-row-artist">{artista}</span>
                                    </div>

                                    <div className="sc-row-details">
                                        <span className="sc-row-bpm">{track.bpm} BPM</span>
                                        <span className="sc-row-key">{track.tonalidad}</span>
                                    </div>

                                    {esMiColeccion && (
                                        <button
                                            className="sc-row-remove-btn"
                                            onClick={() => desasignarCancion(track)}
                                            title="Remover de la colección"
                                        >
                                            <FaTimes />
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p className="sc-empty-tracks">Esta colección aún no tiene canciones asignadas.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DetallesColeccion;