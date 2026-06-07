import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { FaUser } from "react-icons/fa";
import API_URL from "../../config/api.js";
import { contextoMusica } from "../../contexts/ProveedorMusica.jsx";
import { contextoNotificaciones } from "../../contexts/ProveedorNotificaciones.jsx";
import { generarPortadaPlaceholder } from "../../utils/imagen.js";
import { tieneSesion } from "../../utils/sesion.js";
import { useLike } from "../../hooks/Cancion/useLike.js";
import { useComentarios } from "../../hooks/Cancion/useComentarios.js";
import ReproductorDetalles from "./ReproductorDetalles.jsx";
import PlaylistSelector from "./PlaylistSelector.jsx";
import "./DetallesCancion.css";

const DetallesCancion = ({ cancionBuscada }) => {
    const { playlists, refrescarPlaylistsYColecciones } = useContext(contextoMusica) || {};
    const notificaciones = useContext(contextoNotificaciones);
    const { toggleLike, isLiked, getLikeCount } = useLike();
    const { agregarComentario, obtenerComentarios, eliminarComentario, cargarComentarios } = useComentarios();

    const { id, titulo, portada, usuario, bpm, tonalidad, estilos = [], colaboradores = [], reproducciones_count = 0, fecha_publicacion } = cancionBuscada;
    const imagenPorDefecto = generarPortadaPlaceholder(titulo || 'Canción', false);

    const [nuevoComentario, setNuevoComentario] = useState('');
    const [tiempoActual, setTiempoActual] = useState(0);
    const [seekTime, setSeekTime] = useState(null);
    const [mostrarSelectPlaylist, setMostrarSelectPlaylist] = useState(false);
    const [reproduccionesActuales, setReproduccionesActuales] = useState(reproducciones_count);
    const [yaContada, setYaContada] = useState(false);
    const [avataresFallidos, setAvataresFallidos] = useState({});

    const [likeState, setLikeState] = useState({});

    const comentarios = obtenerComentarios(id);
    const esLiked = likeState[id]?.liked || false;
    const likeCount = likeState[id]?.count || 0;

    // Cargar datos iniciales cuando la canción cambia
    useEffect(() => {
        // Actualizar reproducciones
        setReproduccionesActuales(reproducciones_count);
        setYaContada(false);

        // Cargar datos completos de la canción incluyendo likes_count
        const cargarDatosCancion = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/api/canciones/${id}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });

                if (response.ok) {
                    const datosCompletos = await response.json();
                    const likesCount = datosCompletos.likes_count || 0;
                    const usuarioLiked = datosCompletos.liked_by_me || false;

                    setLikeState(prev => ({
                        ...prev,
                        [id]: {
                            liked: usuarioLiked,
                            count: likesCount
                        }
                    }));
                }
            } catch (error) {
                console.error('Error cargando datos de canción:', error);

                // Fallback: usar datos del props
                const likesCount = cancionBuscada?.likes_count || 0;
                const usuarioLiked = cancionBuscada?.liked_by_me || false;

                setLikeState(prev => ({
                    ...prev,
                    [id]: {
                        liked: usuarioLiked,
                        count: likesCount
                    }
                }));
            }
        };

        cargarDatosCancion();

        // Cargar los comentarios de esta canción desde el backend (visibles para todos)
        cargarComentarios(id);
    }, [id, reproducciones_count]);

    // Incrementar reproducciones cuando se reproduce
    const incrementarReproducciones = () => {
        if (!yaContada) {
            setReproduccionesActuales(prev => prev + 1);
            setYaContada(true);

            // Sincronizar con backend
            fetch(`${API_URL}/api/canciones/${id}/reproducir`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then(res => {
                    if (!res.ok) {
                        console.error(`❌ Error ${res.status}:`, res.statusText);
                        return res.json().then(data => {
                            console.error('Respuesta del servidor:', data);
                        });
                    }
                    return res.json();
                })
                .then(data => {
                    // Reproducción sincronizada con BD
                })
                .catch(e => console.error('❌ Error sincronizando reproducciones:', e));
        }
    };

    const handleToggleLike = async () => {
        const resultado = await toggleLike(id);

        // Actualizar estado local con la respuesta del backend
        if (resultado && typeof resultado === 'object' && 'liked' in resultado) {
            setLikeState(prev => ({
                ...prev,
                [id]: {
                    liked: resultado.liked,
                    count: resultado.count
                }
            }));
        } else {
            console.error('❌ Error al actualizar like. Resultado:', resultado);
        }
    };

    const handleAgregarComentario = async () => {
        if (nuevoComentario.trim()) {
            const creado = await agregarComentario(id, nuevoComentario, tiempoActual);
            if (creado) {
                setNuevoComentario('');
            } else {
                notificaciones?.error?.('No se pudo publicar el comentario');
            }
        }
    };

    const handleEliminarComentario = async (comentarioId) => {
        const ok = await eliminarComentario(id, comentarioId);
        if (!ok) {
            notificaciones?.error?.('No se pudo eliminar el comentario');
        }
    };

    const handleAgregarAPlaylist = async (playlistId) => {
        if (!playlistId) return;

        try {
            const token = localStorage.getItem('token');

            // Verificar si la canción ya está en la playlist (prevenir duplicados)
            const playlistSeleccionada = playlists?.find(p => p.id === playlistId);
            if (playlistSeleccionada?.canciones?.some(c => c.id === id)) {
                notificaciones.error('Esta canción ya está en la playlist');
                return;
            }

            const response = await fetch(`${API_URL}/api/playlists/${playlistId}/agregar-cancion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ id_cancion: id })
            });

            if (response.ok) {
                notificaciones.exito('Canción agregada a playlist');
                setMostrarSelectPlaylist(false); // Cierra automáticamente el selector
                // Refrescar playlists y colecciones para mantener datos sincronizados
                if (refrescarPlaylistsYColecciones) {
                    await refrescarPlaylistsYColecciones();
                }
            } else {
                const error = await response.json();
                if (error.message?.includes('ya existe')) {
                    notificaciones.error('Esta canción ya está en la playlist');
                } else {
                    notificaciones.error(error.message || 'No se pudo agregar a la playlist');
                }
            }
        } catch (error) {
            console.error('Error agregando a playlist:', error);
            notificaciones.error('Error al agregar la canción a la playlist');
        }
    };


    const handleSaltarAComentario = (tiempoSegundos) => {
        if (tiempoSegundos !== undefined) {
            // Resetear primero para asegurar que el cambio se detecte
            setSeekTime(null);
            // Luego establecer el nuevo tiempo con un pequeño delay
            setTimeout(() => {
                setSeekTime(tiempoSegundos);
            }, 50);
        }
    };

    const formatearTiempo = (segundos) => {
        if (!segundos) return '00:00';
        const minutos = Math.floor(segundos / 60);
        const segs = Math.floor(segundos % 60);
        return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    };

    // Filtrar playlists del usuario actual (excluir "Me gusta" - playlist de sistema para likes)
    const usuarioActual = JSON.parse(localStorage.getItem('usuario')) || {};
    const playlistsDisponibles = (playlists || []).filter(
        p => p.id_usuario === usuarioActual.id && p.titulo !== 'Me gusta'
    );

    return (
        <div className="detalles-cancion">
            {/* HERO SECTION - Portada + Info */}
            <section className="hero-cancion">
                {/* LEFT: Portada + Info */}
                <div>
                    <div className="portada-grande">
                        <img
                            src={portada || imagenPorDefecto}
                            alt=""
                            onError={(e) => (e.target.src = imagenPorDefecto)}
                        />
                        <div className="play-grande-overlay">▶</div>
                    </div>

                    <div className="info-cancion">
                        <h1>{titulo}</h1>

                        <div className="artista-link">
                            <Link to={`/mostrar/usuario/${usuario?.id}`}>
                                {usuario?.nick || usuario?.nombre || 'Artista'}
                            </Link>
                        </div>

                        {/* Géneros/Estilos */}
                        {estilos && estilos.length > 0 && (
                            <div style={{ marginTop: '12px', display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                {estilos.map((estilo) => (
                                    <span
                                        key={estilo.id}
                                        style={{
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            border: `1px solid ${estilo.color || '#0ADAF5'}`,
                                            color: estilo.color || '#0ADAF5',
                                            backgroundColor: 'transparent'
                                        }}
                                    >
                                        {estilo.nombre}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Controls */}
                <div>
                    {/* Stats y Botones de Acción - ARRIBA DEL REPRODUCTOR */}
                    <div className="stats">
                        <span>{reproduccionesActuales} reproducciones</span>
                        <div className="stats-botones">
                            <button
                                onClick={handleToggleLike}
                                className={`btn-like ${esLiked ? 'liked' : ''}`}
                                title={esLiked ? 'Remover de Me gusta' : 'Agregar a Me gusta'}
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                                {likeCount}
                            </button>
                            <button
                                className="btn-agregar-playlist"
                                onClick={() => setMostrarSelectPlaylist(!mostrarSelectPlaylist)}
                                title="Agregar a otra playlist"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                                </svg>
                                Playlist
                            </button>
                        </div>
                    </div>

                    {/* Selector de Playlist - Moderno */}
                    {mostrarSelectPlaylist && (
                        <PlaylistSelector
                            playlists={playlistsDisponibles}
                            onConfirm={handleAgregarAPlaylist}
                            onClose={() => setMostrarSelectPlaylist(false)}
                        />
                    )}

                    {/* REPRODUCTOR DEDICADO - JUSTO DONDE ESTÁ */}
                    <div className="reproductor-hero">
                        <ReproductorDetalles
                            cancion={cancionBuscada}
                            onTimeChange={setTiempoActual}
                            seekTime={seekTime}
                            onPlay={incrementarReproducciones}
                        />
                    </div>
                </div>
            </section>

            {/* Características */}
            <div className="metadata">
                        {/* Otras características */}
                        <div className="metadata-fila">
                            {bpm && (
                                <div className="metadata-item">
                                    <span className="metadata-label">BPM</span>
                                    <span className="metadata-value">{bpm}</span>
                                </div>
                            )}
                            {tonalidad && (
                                <div className="metadata-item">
                                    <span className="metadata-label">Tonalidad</span>
                                    <span className="metadata-value">{tonalidad}</span>
                                </div>
                            )}
                            {fecha_publicacion && (
                                <div className="metadata-item">
                                    <span className="metadata-label">Publicado</span>
                                    <span className="metadata-value">{new Date(fecha_publicacion).getFullYear()}</span>
                                </div>
                            )}
                        </div>

                        {/* Colaboradores */}
                        {colaboradores && colaboradores.length > 0 && (
                            <div className="colaboradores-section">
                                <h3>Colaboradores</h3>
                                <div className="colaboradores-lista">
                                    {colaboradores.map((colab) => (
                                        <Link key={colab.id} to={`/mostrar/usuario/${colab.id}`} className="colaborador-item">
                                            <div className="colaborador-avatar-container">
                                                {!avataresFallidos[colab.id] && colab.avatar ? (
                                                    <img
                                                        src={colab.avatar}
                                                        alt={colab.nick}
                                                        className="colaborador-avatar"
                                                        onError={() => setAvataresFallidos(prev => ({...prev, [colab.id]: true}))}
                                                    />
                                                ) : (
                                                    <FaUser className="colaborador-avatar-icon" />
                                                )}
                                            </div>
                                            <div className="colaborador-info">
                                                <span className="colaborador-nombre">{colab.nick || colab.nombre}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

            {/* SECCIÓN DE COMENTARIOS */}
            <section className="comentarios-seccion">
                <h2>Comentarios ({comentarios.length})</h2>

                {/* Formulario nuevo comentario - SOLO si hay sesion */}
                {tieneSesion() ? (
                    <div className="comentario-nuevo">
                        <textarea
                            placeholder="Comparte tu opinión sobre esta canción..."
                            value={nuevoComentario}
                            onChange={(e) => setNuevoComentario(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.ctrlKey && e.key === 'Enter') {
                                    handleAgregarComentario();
                                }
                            }}
                        />
                        <div className="comentario-nuevo-footer">
                            <button onClick={handleAgregarComentario}>
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16147071 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99397806 L3.03521743,10.4349711 C3.03521743,10.5920685 3.34915502,10.7491658 3.50612381,10.7491658 L16.6915026,11.5346527 C16.6915026,11.5346527 17.1624089,11.5346527 17.1624089,12.0059448 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
                                </svg>
                                Comentar en {formatearTiempo(tiempoActual)}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{
                        padding: '20px',
                        textAlign: 'center',
                        backgroundColor: 'rgba(10, 173, 245, 0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(10, 173, 245, 0.2)',
                        marginBottom: '20px'
                    }}>
                        <p style={{ margin: '0 0 16px 0', color: '#999' }}>Inicia sesión o regístrate para comentar</p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/login" style={{
                                display: 'inline-block',
                                padding: '10px 20px',
                                backgroundColor: '#0ADAF5',
                                color: '#000',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                fontWeight: '600',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }} onMouseEnter={(e) => e.target.style.opacity = '0.8'} onMouseLeave={(e) => e.target.style.opacity = '1'}>
                                Iniciar sesión
                            </Link>
                            <Link to="/registro" style={{
                                display: 'inline-block',
                                padding: '10px 20px',
                                backgroundColor: 'transparent',
                                color: '#0ADAF5',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                fontWeight: '600',
                                border: '1px solid #0ADAF5',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }} onMouseEnter={(e) => { e.target.style.backgroundColor = '#0ADAF5'; e.target.style.color = '#000'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#0ADAF5'; }}>
                                Regístrate
                            </Link>
                        </div>
                    </div>
                )}

                {/* Lista de comentarios */}
                <div className="lista-comentarios">
                    {comentarios.length === 0 ? (
                        <div className="comentarios-vacio">
                            <p>Sé el primero en comentar</p>
                            <p style={{ fontSize: '0.9rem', marginTop: '8px', color: '#666' }}>
                                Comparte tu opinión sobre esta canción
                            </p>
                        </div>
                    ) : (
                        <div className="comentarios-contenedor">
                            {comentarios.map((comentario) => (
                                <div key={comentario.id} className="comentario-item">
                                    {comentario.usuario.avatar ? (
                                        <>
                                            <img
                                                src={comentario.usuario.avatar}
                                                alt={comentario.usuario.nombre}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    const fb = e.target.nextElementSibling;
                                                    if (fb) fb.style.display = 'flex';
                                                }}
                                            />
                                            <FaUser className="comentario-avatar-icon" style={{ display: 'none' }} />
                                        </>
                                    ) : (
                                        <FaUser className="comentario-avatar-icon" />
                                    )}
                                    <div className="comentario-contenido">
                                        <div className="comentario-header">
                                            <strong>{comentario.usuario.nombre}</strong>
                                            <span className="timestamp">
                                                <button
                                                    onClick={() => {
                                                        handleSaltarAComentario(comentario.tiempoSegundos);
                                                    }}
                                                    title="Click para saltar a este momento"
                                                >
                                                    {comentario.timestamp}
                                                </button>
                                            </span>
                                        </div>

                                        <p>{comentario.texto}</p>

                                        <div className="comentario-meta">
                                            <span className="comentario-fecha">
                                                {new Date(comentario.fechaCreacion).toLocaleDateString()} {' '}
                                                {new Date(comentario.fechaCreacion).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            {/* El boton de eliminar solo aparece en los comentarios propios */}
                                            {comentario.usuario.id === usuarioActual.id && (
                                                <button
                                                    className="btn-eliminar-comentario"
                                                    onClick={() => handleEliminarComentario(comentario.id)}
                                                    title="Eliminar comentario"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default DetallesCancion;
