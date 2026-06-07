import React, { useState, useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaTwitter, FaInstagram, FaYoutube, FaSpotify, FaTiktok, FaSoundcloud, FaMusic, FaMapPin, FaEdit, FaPlay, FaPause, FaCamera, FaMicrophone, FaTrash, FaPlus, FaImage, FaUser } from "react-icons/fa";
import API_URL from "../../config/api.js";
import { contextoMusica } from "../../contexts/ProveedorMusica.jsx";
import { contextoEquipamiento } from "../../contexts/ProveedorEquipamiento.jsx";
import { contextoEvento } from "../../contexts/ProveedorEvento.jsx";
import { contextoNotificaciones } from "../../contexts/ProveedorNotificaciones.jsx";
import PortadaPorDefecto from "../../assets/portada-default.jpg";
import AvatarPorDefecto from "../../assets/user-default.jpg";
import SubirCancion from "../SubirCancion.jsx";
import SubirColeccion from "../SubirColeccion.jsx";
import SubirPlaylist from "../SubirPlaylist.jsx";
import SubirEvento from "../SubirEvento.jsx";
import EditarPerfil from "../EditarPerfil.jsx";
import GestionarEquipamiento from "../GestionarEquipamiento.jsx";
import { useFollow } from "../../hooks/Auth/useFollow.js";
import { resolverRutaArchivo as resolverRutaArchivoUtil, generarAvatarDicebear, generarPortadaPlaceholder, generarColoresDesdeString } from "../../utils/imagen.js";
import useApiPost_Galeria from "../../hooks/Galeria/useApiPost.js";
import useApiDelete_Galeria from "../../hooks/Galeria/useApiDelete.js";
import useApiDelete_Coleccion from "../../hooks/Coleccion/useApiDelete.js";
import useApiDelete_Playlist from "../../hooks/Playlist/useApiDelete.js";
import useApiDelete_Cancion from "../../hooks/Cancion/UseApiDelete.js";

import "./DetallesUsuario.css";

const URL_STORAGE = `${API_URL}/storage/`;

const obtenerImagen = (ruta) => {
    if (!ruta) return null;
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
    return `${URL_STORAGE}${ruta.startsWith('/') ? ruta.substring(1) : ruta}`;
};

const DetallesUsuario = ({ datosUsuario, refrescarTodo }) => {
    const [modalAbierto, setModalAbierto] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [datosEdicion, setDatosEdicion] = useState(null);
    const [avatarCargado, setAvatarCargado] = useState(!!datosUsuario?.avatar);

    const {
        canciones: cancionesGlobales,
        colecciones: coleccionesGlobales,
        iniciarCanciones,
        reproducirTrack,
        trackActual,
        isPlaying
    } = useContext(contextoMusica);

    const { guardarEquipamiento, misHardwares, misSoftwares } = useContext(contextoEquipamiento);
    const { eliminarEvento } = useContext(contextoEvento);
    const notificaciones = useContext(contextoNotificaciones);

    // Estado para canciones locales (para refrescar)
    const [cancionesLocales, setCancionesLocales] = React.useState(cancionesGlobales);

    // Estado local para canciones (para polling de reproducciones)
    // NO usar estado para hardware/software - renderizar directo de datosUsuario

    // Obtener usuario logueado y determinar si es mi perfil
    const usuarioLogueadoLocal = JSON.parse(localStorage.getItem('usuario'));
    const esMiPerfil = usuarioLogueadoLocal && datosUsuario && usuarioLogueadoLocal.id === datosUsuario.id;

    // Refrescamos las canciones al entrar para que el contador de reproducciones esté al día
    useEffect(() => {
        const refrescarCanciones = async () => {
            try {
                // Si es mi perfil, usar autenticación para obtener también canciones privadas
                const token = localStorage.getItem('token');
                const headers = {};
                if (esMiPerfil && token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const res = await fetch(`${API_URL}/api/canciones`, { headers });
                const data = await res.json();
                setCancionesLocales(data);
            } catch (e) {
                console.error('❌ Error cargando canciones:', e);
                setCancionesLocales(cancionesGlobales);
            }
        };

        if (iniciarCanciones) {
            iniciarCanciones();
        }
        refrescarCanciones();

        // 🔄 POLLING: Verificar nuevas canciones y reproducciones cada 5 segundos (más frecuente)
        const intervaloPolling = setInterval(() => {
            refrescarCanciones();
        }, 5000); // 5 segundos para captar cambios de reproducciones más rápido

        // Limpieza al desmontar
        return () => clearInterval(intervaloPolling);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [datosUsuario?.id, esMiPerfil]); // Recargar cuando cambia el usuario o si es mi perfil

    // 🔄 SINCRONIZAR: Si el contexto global cambia, actualizar también
    useEffect(() => {
        if (cancionesGlobales && cancionesGlobales.length > 0) {
            setCancionesLocales(cancionesGlobales);
        }
    }, [cancionesGlobales]);

    // 🔄 Actualizar estado del avatar cuando cambia el usuario
    useEffect(() => {
        setAvatarCargado(!!datosUsuario?.avatar);
    }, [datosUsuario?.avatar]);


    if (!datosUsuario) {
        return <div className="sc-loader">Cargando...</div>;
    }

    const {
        id, nick, nombre, ubicacion, latitud, longitud, avatar, rol, banner, biografia,
        twitter, instagram, youtube, spotify, tiktok, soundcloud,
        playlists, seguidos, seguidores, eventos, galeria, colecciones, canciones
    } = datosUsuario;

    // Usar hardwares y softwares actuales (sincronizados del contexto)
    // Usar directamente de datosUsuario (ya viene cargado del backend)
    const hardwares = datosUsuario?.hardwares || [];
    const softwares = datosUsuario?.softwares || [];

    // 🆕 Integración del Hook
    const { toggleFollow } = useFollow();
    const [esSiguiendo, setEsSiguiendo] = useState(seguidores?.some(seg => seg.id === usuarioLogueadoLocal?.id) || false);

    const handleFollowClick = async () => {
        const result = await toggleFollow(id);
        if (result) {
            setEsSiguiendo(result.following);
            if (refrescarTodo) {
                await refrescarTodo();
            }
        }
    };

    // Filtrar canciones: SIEMPRE usar cancionesLocales que se actualiza en tiempo real
    // de lo contrario nunca vemos cambios de reproducciones
    const cancionesDelUsuario = cancionesLocales.filter(track =>
        String(track.id_usuario) === String(id) &&
        (track.privacidad === 'publica' || esMiPerfil)
    );

    // Filtrar colecciones: mostrar públicas + privadas si es mi perfil
    const coleccionesDelUsuario = (colecciones && colecciones.length > 0)
        ? colecciones.filter(col => col.privacidad === 'publica' || esMiPerfil)
        : coleccionesGlobales.filter(col =>
            String(col.id_usuario) === String(id) &&
            (col.privacidad === 'publica' || esMiPerfil)
          );

    // Filtrar playlists: mostrar públicas + privadas si es mi perfil
    const playlistsDelUsuario = (playlists || []).filter(pl =>
        String(pl.id_usuario) === String(id) &&
        (pl.privacidad === 'publica' || esMiPerfil)
    );

    // Total de reproducciones del artista (suma de todas sus canciones)
    const totalReproducciones = cancionesDelUsuario.reduce(
        (acc, track) => acc + (track.reproducciones_count || 0),
        0
    );

    // 🆕 Detectar estilos únicos de sus canciones
    const estilosUnicos = (() => {
        const estilosMap = new Map();

        cancionesDelUsuario.forEach(track => {
            // Usar el nuevo formato: track.estilos es un array de objetos {id, nombre, color}
            if (track.estilos && Array.isArray(track.estilos)) {
                track.estilos.forEach(estilo => {
                    if (estilo.nombre && !estilosMap.has(estilo.id)) {
                        estilosMap.set(estilo.id, {
                            nombre: estilo.nombre,
                            color: estilo.color || '#0ADAF5'
                        });
                    }
                });
            }
            // Fallback al campo antiguo si aún existe
            else if (track.estilo && track.estilo.trim() !== '') {
                const estiloTrim = track.estilo.trim();
                if (!estilosMap.has(estiloTrim)) {
                    estilosMap.set(estiloTrim, {
                        nombre: estiloTrim,
                        color: '#0ADAF5'
                    });
                }
            }
        });

        return Array.from(estilosMap.values());
    })();

    // Helper para generar portada placeholder
    const obtenerPortada = (itemId, itemTitulo) => {
        const { fondo, texto } = generarColoresDesdeString(itemId);
        return generarPortadaPlaceholder(itemTitulo, fondo, texto);
    };

    const abrirEdicion = async (e, tipo, item) => {
        e.preventDefault();
        e.stopPropagation();

        // Si es colección, playlist, canción o evento, obtener datos completos con colaboradores
        if ((tipo === 'coleccion' || tipo === 'playlist' || tipo === 'cancion' || tipo === 'evento') && item?.id) {
            try {
                let endpoint;
                if (tipo === 'coleccion') {
                    endpoint = `/api/colecciones/${item.id}`;
                } else if (tipo === 'playlist') {
                    endpoint = `/api/playlists/${item.id}`;
                } else if (tipo === 'cancion') {
                    endpoint = `/api/canciones/${item.id}`;
                } else if (tipo === 'evento') {
                    endpoint = `/api/eventos/${item.id}`;
                }

                // Obtener token para autenticación
                const token = localStorage.getItem('token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                const response = await fetch(`${API_URL}${endpoint}`, { headers });
                if (response.ok) {
                    const datosCompletos = await response.json();
                    setDatosEdicion(datosCompletos);
                } else {
                    // Si la API falla, usar los datos que tenemos
                    setDatosEdicion(item);
                }
            } catch (error) {
                console.error('Error obteniendo datos completos:', error);
                // Si hay error, usar los datos que tenemos
                setDatosEdicion(item);
            }
        } else {
            setDatosEdicion(item);
        }

        setModalAbierto(tipo);
    };

    // Cerrar modal con ESC o click fuera
    useEffect(() => {
        const manejarESC = (e) => {
            if (e.key === 'Escape' && modalAbierto) {
                setModalAbierto(null);
                setDatosEdicion(null);
            }
        };

        if (modalAbierto) {
            window.addEventListener('keydown', manejarESC);
            return () => window.removeEventListener('keydown', manejarESC);
        }
    }, [modalAbierto]);

    const manejarExito = async () => {
        setModalAbierto(null);
        setDatosEdicion(null);
        setMenuVisible(false);

        // 🔄 Refrescar canciones locales inmediatamente después de publicar/editar
        try {
            const res = await fetch(`${API_URL}/api/canciones`);
            const data = await res.json();
            setCancionesLocales(data);
        } catch (e) {
            console.error('Error refrescando canciones:', e);
        }

        // 🔄 Refrescar eventos después de crear/editar
        try {
            const resEventos = await fetch(`${API_URL}/api/eventos`);
            if (resEventos.ok) {
                const dataEventos = await resEventos.json();
            }
        } catch (e) {
            console.error('Error refrescando eventos:', e);
        }

        if (refrescarTodo) refrescarTodo();
    };

    // --- GALERÍA ---
    const inputFotosRef = useRef(null);
    const [lightboxImg, setLightboxImg] = useState(null);
    const [subiendoFotos, setSubiendoFotos] = useState(false);

    // Cerrar lightbox con ESC
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Escape' && lightboxImg) {
                setLightboxImg(null);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [lightboxImg]);

    const handleSubirFotos = async (e) => {
        const archivos = Array.from(e.target.files || []);
        if (archivos.length === 0) return;

        const token = localStorage.getItem('token');
        if (!token) {
            notificaciones.error("Debes iniciar sesión para subir imágenes");
            return;
        }

        setSubiendoFotos(true);
        try {
            for (const archivo of archivos) {
                const res = await useApiPost_Galeria(archivo, token);
                if (res?.error) {
                    notificaciones.error("Error al subir una imagen: " + (res.detalles || "inténtalo de nuevo"));
                }
            }
            if (refrescarTodo) await refrescarTodo();
        } catch (error) {
            console.error("Error subiendo fotos a la galería:", error);
            notificaciones.error("Ocurrió un error al subir las imágenes");
        } finally {
            setSubiendoFotos(false);
            if (inputFotosRef.current) inputFotosRef.current.value = "";
        }
    };

    const handleBorrarFoto = async (idFoto) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await useApiDelete_Galeria(idFoto, token);
        if (res && !res.error) {
            if (refrescarTodo) await refrescarTodo();
            notificaciones.exito("Imagen eliminada correctamente de la galería");
        } else {
            notificaciones.error(res?.detalles || "No se pudo eliminar la imagen");
        }
    };

    const handleEliminarRapido = async (tipo, elementoId, nombreElemento) => {
        try {
                let res;

                if (tipo === 'evento') {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        notificaciones.error("Debes iniciar sesión para eliminar eventos");
                        return;
                    }
                    res = await useApiDelete_Evento(elementoId, token);
                } else {
                    // Para hardware y software, desvincular (no eliminar del catálogo)
                    // usando guardarEquipamiento con la lista filtrada
                    if (tipo === 'hardware') {
                        const equipoFiltrado = hardwares.filter(hw => hw.id !== elementoId);
                        const hardwareIds = equipoFiltrado.map(hw => hw.id);
                        const softwareIds = softwares.map(sw => sw.id);
                        res = await guardarEquipamiento(hardwareIds, softwareIds);
                    } else if (tipo === 'software') {
                        const equipoFiltrado = softwares.filter(sw => sw.id !== elementoId);
                        const hardwareIds = hardwares.map(hw => hw.id);
                        const softwareIds = equipoFiltrado.map(sw => sw.id);
                        res = await guardarEquipamiento(hardwareIds, softwareIds);
                    }
                }

                if (res && !res.error) {
                    notificaciones.exito(`"${nombreElemento}" ha sido eliminado`);
                    // Refrescar para actualizar datosUsuario con el equipamiento desvinculado
                    if (refrescarTodo) {
                        await refrescarTodo();
                    }
                } else {
                    notificaciones.error(res?.message || "No se pudo eliminar el elemento");
                }
        } catch (error) {
            console.error("Error crítico al eliminar:", error);
            notificaciones.error("Ocurrió un error inesperado al intentar eliminar");
        }
    };

    const handleEliminarElemento = async (tipo, elementoId, nombreElemento, nombreTipo) => {

        try {
            let res;
            const token = localStorage.getItem('token');

            if (!token) {
                notificaciones.error("Debes iniciar sesión para eliminar elementos.");
                return;
            }

            // Llamar hook DELETE correspondiente
            switch (tipo) {
                case 'coleccion':
                    res = await useApiDelete_Coleccion(elementoId, token);
                    break;
                case 'playlist':
                    res = await useApiDelete_Playlist(elementoId, token);
                    break;
                case 'cancion':
                    res = await useApiDelete_Cancion(elementoId, token);
                    break;
                case 'evento':
                    // Usar el método del contexto que actualiza automáticamente el mapa
                    res = await eliminarEvento(elementoId);
                    break;
                default:
                    notificaciones.error("Tipo de elemento no soportado");
                    return;
            }

            if (res && !res.error) {
                // 🔄 Refrescar datos primero, luego mostrar notificación
                if (refrescarTodo) await refrescarTodo();
                // Mostrar notificación DESPUÉS de que se actualice la UI
                notificaciones.exito(`"${nombreElemento}" ha sido eliminado`);
            } else {
                notificaciones.error(`Error: ${res?.message || res?.detalles || "intenta de nuevo"}`);
            }
        } catch (error) {
            console.error("Error eliminando:", error);
            notificaciones.error("Error inesperado al eliminar el elemento");
        }
    };

    // Wrapper que mantiene la firma anterior con fallback a PortadaPorDefecto
    const resolverRutaArchivo = (campoArchivo, fallback = PortadaPorDefecto) =>
        resolverRutaArchivoUtil(campoArchivo, fallback);

    return (
        <div className={`sc-profile-page ${esMiPerfil ? 'is-owner-view' : ''}`}>
            {/* --- HERO / BANNER SUPERIOR --- */}
            <header className="sc-hero">
                <div
                    className="sc-hero-bg"
                    style={{ backgroundImage: `url(${resolverRutaArchivo(banner || avatar)})` }}
                ></div>

                <div className="sc-hero-content">
                    <div className="sc-hero-left">
                        <div className="sc-avatar-container">
                            {avatar && avatarCargado ? (
                                <img
                                    src={resolverRutaArchivo(avatar)}
                                    alt={nick}
                                    className="sc-main-avatar"
                                    onError={() => setAvatarCargado(false)}
                                />
                            ) : (
                                <FaUser size={80} color="#0ADAF5" />
                            )}
                        </div>
                        <div className="sc-user-details">
                            <h1 className="sc-nick-big">{nick}</h1>
                            <h2 className="sc-name-big">{nombre}</h2>
                            {biografia && <p className="sc-user-bio">{biografia}</p>}
                            <div className="sc-badges">
                                <span className="sc-badge-grey" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    <FaMapPin size={14} /> {
                                        typeof ubicacion === 'object'
                                            ? (ubicacion?.direccion || ubicacion?.direction || 'Global')
                                            : (ubicacion || 'Global')
                                    }
                                </span>
                            </div>

                            {/* 🆕 Estilos Musicales Detectados */}
                            {estilosUnicos.length > 0 && (
                                <div className="sc-estilos-container" style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {estilosUnicos.map((estilo, idx) => {
                                        const colorEstilo = estilo.color || '#0ADAF5';
                                        return (
                                            <span
                                                key={idx}
                                                className="sc-badge-estilo"
                                                style={{
                                                    backgroundColor: colorEstilo,
                                                    color: '#000',
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    cursor: 'default',
                                                    transition: 'all 0.2s ease',
                                                    border: `2px solid ${colorEstilo}`
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                    e.currentTarget.style.boxShadow = `0 4px 12px ${colorEstilo}40`;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <FaMusic size={14} /> {estilo.nombre}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Redes Sociales con SVG Icons */}
                            {(twitter || instagram || youtube || spotify || tiktok || soundcloud) && (
                                <div className="sc-social-links" style={{ marginTop: '15px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {twitter && (
                                        <a href={twitter} target="_blank" rel="noopener noreferrer" title="Twitter"
                                           style={{
                                               fontSize: '24px',
                                               color: '#0ADAF5',
                                               opacity: 0.7,
                                               cursor: 'pointer',
                                               transition: 'all 0.3s ease',
                                               display: 'inline-flex',
                                               alignItems: 'center',
                                               transform: 'scale(1)'
                                           }}
                                           onMouseEnter={(e) => {
                                               e.currentTarget.style.opacity = '1';
                                               e.currentTarget.style.transform = 'scale(1.3) rotate(-10deg)';
                                               e.currentTarget.style.color = '#FFD700';
                                           }}
                                           onMouseLeave={(e) => {
                                               e.currentTarget.style.opacity = '0.7';
                                               e.currentTarget.style.transform = 'scale(1)';
                                               e.currentTarget.style.color = '#0ADAF5';
                                           }}>
                                            <FaTwitter />
                                        </a>
                                    )}
                                    {instagram && (
                                        <a href={instagram} target="_blank" rel="noopener noreferrer" title="Instagram"
                                           style={{
                                               fontSize: '24px',
                                               color: '#0ADAF5',
                                               opacity: 0.7,
                                               cursor: 'pointer',
                                               transition: 'all 0.3s ease',
                                               display: 'inline-flex',
                                               alignItems: 'center',
                                               transform: 'scale(1)'
                                           }}
                                           onMouseEnter={(e) => {
                                               e.currentTarget.style.opacity = '1';
                                               e.currentTarget.style.transform = 'scale(1.3) rotate(10deg)';
                                               e.currentTarget.style.color = '#FFD700';
                                           }}
                                           onMouseLeave={(e) => {
                                               e.currentTarget.style.opacity = '0.7';
                                               e.currentTarget.style.transform = 'scale(1)';
                                               e.currentTarget.style.color = '#0ADAF5';
                                           }}>
                                            <FaInstagram />
                                        </a>
                                    )}
                                    {youtube && (
                                        <a href={youtube} target="_blank" rel="noopener noreferrer" title="YouTube"
                                           style={{
                                               fontSize: '24px',
                                               color: '#0ADAF5',
                                               opacity: 0.7,
                                               cursor: 'pointer',
                                               transition: 'all 0.3s ease',
                                               display: 'inline-flex',
                                               alignItems: 'center',
                                               transform: 'scale(1)'
                                           }}
                                           onMouseEnter={(e) => {
                                               e.currentTarget.style.opacity = '1';
                                               e.currentTarget.style.transform = 'scale(1.3) rotate(-10deg)';
                                               e.currentTarget.style.color = '#FFD700';
                                           }}
                                           onMouseLeave={(e) => {
                                               e.currentTarget.style.opacity = '0.7';
                                               e.currentTarget.style.transform = 'scale(1)';
                                               e.currentTarget.style.color = '#0ADAF5';
                                           }}>
                                            <FaYoutube />
                                        </a>
                                    )}
                                    {spotify && (
                                        <a href={spotify} target="_blank" rel="noopener noreferrer" title="Spotify"
                                           style={{
                                               fontSize: '24px',
                                               color: '#0ADAF5',
                                               opacity: 0.7,
                                               cursor: 'pointer',
                                               transition: 'all 0.3s ease',
                                               display: 'inline-flex',
                                               alignItems: 'center',
                                               transform: 'scale(1)'
                                           }}
                                           onMouseEnter={(e) => {
                                               e.currentTarget.style.opacity = '1';
                                               e.currentTarget.style.transform = 'scale(1.3) rotate(10deg)';
                                               e.currentTarget.style.color = '#FFD700';
                                           }}
                                           onMouseLeave={(e) => {
                                               e.currentTarget.style.opacity = '0.7';
                                               e.currentTarget.style.transform = 'scale(1)';
                                               e.currentTarget.style.color = '#0ADAF5';
                                           }}>
                                            <FaSpotify />
                                        </a>
                                    )}
                                    {tiktok && (
                                        <a href={tiktok} target="_blank" rel="noopener noreferrer" title="TikTok"
                                           style={{
                                               fontSize: '24px',
                                               color: '#0ADAF5',
                                               opacity: 0.7,
                                               cursor: 'pointer',
                                               transition: 'all 0.3s ease',
                                               display: 'inline-flex',
                                               alignItems: 'center',
                                               transform: 'scale(1)'
                                           }}
                                           onMouseEnter={(e) => {
                                               e.currentTarget.style.opacity = '1';
                                               e.currentTarget.style.transform = 'scale(1.3) rotate(-10deg)';
                                               e.currentTarget.style.color = '#FFD700';
                                           }}
                                           onMouseLeave={(e) => {
                                               e.currentTarget.style.opacity = '0.7';
                                               e.currentTarget.style.transform = 'scale(1)';
                                               e.currentTarget.style.color = '#0ADAF5';
                                           }}>
                                            <FaTiktok />
                                        </a>
                                    )}
                                    {soundcloud && (
                                        <a href={soundcloud} target="_blank" rel="noopener noreferrer" title="SoundCloud"
                                           style={{
                                               fontSize: '24px',
                                               color: '#0ADAF5',
                                               opacity: 0.7,
                                               cursor: 'pointer',
                                               transition: 'all 0.3s ease',
                                               display: 'inline-flex',
                                               alignItems: 'center',
                                               transform: 'scale(1)'
                                           }}
                                           onMouseEnter={(e) => {
                                               e.currentTarget.style.opacity = '1';
                                               e.currentTarget.style.transform = 'scale(1.3) rotate(10deg)';
                                               e.currentTarget.style.color = '#FFD700';
                                           }}
                                           onMouseLeave={(e) => {
                                               e.currentTarget.style.opacity = '0.7';
                                               e.currentTarget.style.transform = 'scale(1)';
                                               e.currentTarget.style.color = '#0ADAF5';
                                           }}>
                                            <FaSoundcloud />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="sc-hero-right">
                        {/* 🆕 BOTÓN SEGUIR */}
                        {!esMiPerfil && usuarioLogueadoLocal && (
                            <button 
                                onClick={handleFollowClick}
                                style={{
                                    backgroundColor: esSiguiendo ? "transparent" : "#0ADAF5",
                                    color: esSiguiendo ? "#0ADAF5" : "#000",
                                    border: "2px solid #0ADAF5",
                                    padding: "8px 20px",
                                    borderRadius: "20px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    marginRight: "15px"
                                }}
                            >
                                {esSiguiendo ? "Siguiendo" : "Seguir"}
                            </button>
                        )}

                        {/* BOTÓN GESTIONAR PERFIL */}
                        {esMiPerfil && (
                            <div className="sc-upload-container">
                                <button className="sc-btn-upload" onClick={() => setMenuVisible(!menuVisible)}>
                                    {menuVisible ? 'Cerrar Menú' : 'Gestionar Perfil...'}
                                </button>
                                {menuVisible && (
                                    <>
                                        <div className="sc-menu-overlay" onClick={() => setMenuVisible(false)} />
                                        <div className="sc-upload-menu">
                                            <button onClick={() => { setDatosEdicion(null); setModalAbierto('editar-perfil'); setMenuVisible(false); }} style={{ color: '#FFD700', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><FaEdit size={14} /> Editar Perfil</button>
                                            <button onClick={() => { setDatosEdicion(null); setModalAbierto('setup'); setMenuVisible(false); }} style={{ color: '#FFD700', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><FaEdit size={14} /> Setup (Hardware/Software)</button>
                                            <button onClick={() => { setDatosEdicion(null); setModalAbierto('cancion'); setMenuVisible(false); }} style={{ color: '#0ADAF5' }}>+ Track</button>
                                            <button onClick={() => { setDatosEdicion(null); setModalAbierto('coleccion'); setMenuVisible(false); }} style={{ color: '#0ADAF5' }}>+ Álbum / EP</button>
                                            <button onClick={() => { setDatosEdicion(null); setModalAbierto('playlist'); setMenuVisible(false); }} style={{ color: '#0ADAF5' }}>+ Playlist</button>
                                            <button onClick={() => { setDatosEdicion(null); setModalAbierto('evento'); setMenuVisible(false); }} style={{ color: '#0ADAF5' }}>+ Evento</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="sc-main-grid">
                <div className="sc-content-col">
                    {coleccionesDelUsuario && coleccionesDelUsuario.length > 0 && (
                        <section className="sc-section">
                            <h3 className="sc-section-title">Álbumes & EPs</h3>
                            <div className="sc-playlist-row">
                                {coleccionesDelUsuario.map(col => (
                                    <div key={col.id} style={{ position: 'relative' }} className="sc-gear-item">
                                        <Link to={`/mostrar/coleccion/${col.id}`} className="sc-item-link">
                                            <div className="sc-pl-item">
                                                <img src={resolverRutaArchivo(col.portada) || obtenerPortada(col.id, col.titulo)} alt={col.titulo} onError={(e) => (e.target.src = obtenerPortada(col.id, col.titulo))} />
                                                <p className="sc-pl-title"><strong>{col.titulo}</strong></p>
                                                <span className="sc-type-tag">{col.tipo}</span>
                                            </div>
                                        </Link>
                                        {esMiPerfil && !col.protegida && col.titulo.toLowerCase() !== 'singles' && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '12px',
                                                    right: '12px',
                                                    display: 'flex',
                                                    gap: '6px',
                                                    zIndex: 10
                                                }}
                                            >
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); abrirEdicion(e, 'coleccion', col); }}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: '#999',
                                                        fontSize: '18px',
                                                        transition: 'color 0.2s, transform 0.2s',
                                                        pointerEvents: 'auto',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '4px'
                                                    }}
                                                    onMouseEnter={(e) => { e.target.style.color = '#ccc'; e.target.style.backgroundColor = 'rgba(0,0,0,0.4)'; e.target.style.transform = 'scale(1.1)'; }}
                                                    onMouseLeave={(e) => { e.target.style.color = '#999'; e.target.style.backgroundColor = 'transparent'; e.target.style.transform = 'scale(1)'; }}
                                                    title="Editar colección"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEliminarElemento('coleccion', col.id, col.titulo, 'Colección'); }}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: '#999',
                                                        fontSize: '18px',
                                                        transition: 'color 0.2s, transform 0.2s',
                                                        pointerEvents: 'auto',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '4px'
                                                    }}
                                                    onMouseEnter={(e) => { e.target.style.color = '#ff6b6b'; e.target.style.backgroundColor = 'rgba(0,0,0,0.4)'; e.target.style.transform = 'scale(1.1)'; }}
                                                    onMouseLeave={(e) => { e.target.style.color = '#999'; e.target.style.backgroundColor = 'transparent'; e.target.style.transform = 'scale(1)'; }}
                                                    title="Eliminar colección"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="sc-section">
                        <h3 className="sc-section-title">Playlists</h3>
                        <div className="sc-playlist-row">
                            {playlistsDelUsuario?.map(pl => (
                                <div key={pl.id} style={{ position: 'relative' }} className="sc-gear-item">
                                    <Link to={`/mostrar/playlist/${pl.id}`} className="sc-item-link">
                                        <div className="sc-pl-item">
                                            <img src={resolverRutaArchivo(pl.portada) || obtenerPortada(pl.id, pl.titulo)} alt={pl.titulo} onError={(e) => (e.target.src = obtenerPortada(pl.id, pl.titulo))} />
                                            <p className="sc-pl-title">{pl.titulo}</p>
                                        </div>
                                    </Link>
                                    {esMiPerfil && !pl.protegida && !['singles', 'me gusta'].includes(pl.titulo.toLowerCase()) && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '12px',
                                                right: '12px',
                                                display: 'flex',
                                                gap: '6px',
                                                zIndex: 10
                                            }}
                                        >
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); abrirEdicion(e, 'playlist', pl); }}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: '#999',
                                                    fontSize: '18px',
                                                    transition: 'color 0.2s, transform 0.2s',
                                                    pointerEvents: 'auto',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '4px'
                                                }}
                                                onMouseEnter={(e) => { e.target.style.color = '#ccc'; e.target.style.backgroundColor = 'rgba(0,0,0,0.4)'; e.target.style.transform = 'scale(1.1)'; }}
                                                onMouseLeave={(e) => { e.target.style.color = '#999'; e.target.style.backgroundColor = 'transparent'; e.target.style.transform = 'scale(1)'; }}
                                                title="Editar playlist"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEliminarElemento('playlist', pl.id, pl.titulo, 'Playlist'); }}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: '#999',
                                                    fontSize: '18px',
                                                    transition: 'color 0.2s, transform 0.2s',
                                                    pointerEvents: 'auto',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '4px'
                                                }}
                                                onMouseEnter={(e) => { e.target.style.color = '#ff6b6b'; e.target.style.backgroundColor = 'rgba(0,0,0,0.4)'; e.target.style.transform = 'scale(1.1)'; }}
                                                onMouseLeave={(e) => { e.target.style.color = '#999'; e.target.style.backgroundColor = 'transparent'; e.target.style.transform = 'scale(1)'; }}
                                                title="Eliminar playlist"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="sc-section">
                        <h3 className="sc-section-title">Tracks</h3>
                        <div className="sc-tracks-list">
                            {cancionesDelUsuario?.length > 0 ? cancionesDelUsuario.map(track => {
                                const estaReproduciendo = trackActual?.id === track.id && isPlaying;
                                return (
                                    <div key={track.id} className="sc-track-card sc-gear-item" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => reproducirTrack(track)} title="Reproducir">
                                        <div className="sc-track-art" style={{ position: 'relative' }}>
                                            {track.portada ? (
                                                <img
                                                    src={resolverRutaArchivo(track.portada)}
                                                    alt={track.titulo}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const parent = e.target.parentElement;
                                                        const fallback = parent.querySelector('.track-gradient-fallback');
                                                        if (fallback) fallback.style.display = 'block';
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className="track-gradient-fallback"
                                                style={{
                                                    backgroundImage: `url(${generarPortadaPlaceholder(track.titulo || 'Canción')})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    width: '100%',
                                                    height: '100%',
                                                    borderRadius: '4px',
                                                    display: track.portada ? 'none' : 'block',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0
                                                }}
                                            />
                                            <button className="sc-play-overlay" onClick={(e) => { e.preventDefault(); e.stopPropagation(); reproducirTrack(track); }}>
                                                {estaReproduciendo ? <FaPause size={20} /> : <FaPlay size={20} />}
                                            </button>
                                        </div>
                                        <div className="sc-track-info">
                                            <span className="sc-artist-small">{nick}</span>
                                            {/* El título lleva a los detalles; stopPropagation evita disparar la reproducción del card */}
                                            <Link to={`/mostrar/cancion/${track.id}`} onClick={(e) => e.stopPropagation()} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <h4 style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--sc-orange)'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>{track.titulo}</h4>
                                            </Link>
                                            <div style={{ display: 'flex', gap: '15px', marginTop: '8px', fontSize: '0.85rem', color: 'var(--sc-text-dim)' }}>
                                                {track.estilo && <span style={{ padding: '4px 8px', backgroundColor: 'var(--sc-bg-input)', borderRadius: '4px' }}>{track.estilo}</span>}
                                                {track.bpm && <span style={{ padding: '4px 8px', backgroundColor: 'var(--sc-bg-input)', borderRadius: '4px' }}>BPM: <strong style={{ color: 'var(--sc-accent-neon)' }}>{track.bpm}</strong></span>}
                                                {track.tonalidad && <span style={{ padding: '4px 8px', backgroundColor: 'var(--sc-bg-input)', borderRadius: '4px' }}>KEY: <strong style={{ color: 'var(--sc-accent-neon)' }}>{track.tonalidad}</strong></span>}
                                            </div>
                                        </div>
                                        {esMiPerfil && (
                                            <div
                                                className="sc-track-actions"
                                                style={{
                                                    position: 'absolute',
                                                    top: '12px',
                                                    right: '12px',
                                                    display: 'flex',
                                                    gap: '6px',
                                                    zIndex: 10
                                                }}
                                            >
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); abrirEdicion(e, 'cancion', track); }}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: '#999',
                                                        fontSize: '18px',
                                                        transition: 'color 0.2s, transform 0.2s',
                                                        pointerEvents: 'auto',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '4px'
                                                    }}
                                                    onMouseEnter={(e) => { e.target.style.color = '#ccc'; e.target.style.backgroundColor = 'rgba(0,0,0,0.4)'; e.target.style.transform = 'scale(1.1)'; }}
                                                    onMouseLeave={(e) => { e.target.style.color = '#999'; e.target.style.backgroundColor = 'transparent'; e.target.style.transform = 'scale(1)'; }}
                                                    title="Editar canción"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEliminarElemento('cancion', track.id, track.titulo, 'Canción'); }}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: '#999',
                                                        fontSize: '18px',
                                                        transition: 'color 0.2s, transform 0.2s',
                                                        pointerEvents: 'auto',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '4px'
                                                    }}
                                                    onMouseEnter={(e) => { e.target.style.color = '#ff6b6b'; e.target.style.backgroundColor = 'rgba(0,0,0,0.4)'; e.target.style.transform = 'scale(1.1)'; }}
                                                    onMouseLeave={(e) => { e.target.style.color = '#999'; e.target.style.backgroundColor = 'transparent'; e.target.style.transform = 'scale(1)'; }}
                                                    title="Eliminar canción"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            }) : <p className="sc-empty">No hay tracks subidos todavía.</p>}
                        </div>
                    </section>

                    {/* --- GALERÍA DE IMÁGENES --- */}
                    {(esMiPerfil || (galeria && galeria.length > 0)) && (
                        <section className="sc-section">
                            <div className="sc-galeria-header">
                                <h3 className="sc-section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><FaCamera size={20} /> Galería</h3>
                                {esMiPerfil && (
                                    <>
                                        <input
                                            ref={inputFotosRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleSubirFotos}
                                            style={{ display: 'none' }}
                                        />
                                        <button
                                            type="button"
                                            className="sc-galeria-add-btn"
                                            onClick={() => inputFotosRef.current?.click()}
                                            disabled={subiendoFotos}
                                            title={subiendoFotos ? "Subiendo fotos..." : "Agregar fotos a la galería"}
                                        >
                                            <FaPlus size={18} />
                                        </button>
                                    </>
                                )}
                            </div>

                            {galeria && galeria.length > 0 ? (
                                <div className="sc-galeria-grid">
                                    {galeria.map(foto => (
                                        <div key={foto.id} className="sc-galeria-item">
                                            {foto.imagen ? (
                                                <img
                                                    src={resolverRutaArchivo(foto.imagen)}
                                                    alt="Foto de galería"
                                                    className="sc-galeria-img"
                                                    onClick={() => setLightboxImg(resolverRutaArchivo(foto.imagen))}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const parent = e.target.parentElement;
                                                        const fallback = parent.querySelector('.galeria-icon-fallback');
                                                        if (fallback) fallback.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className="galeria-icon-fallback"
                                                style={{
                                                    display: !foto.imagen ? 'flex' : 'none',
                                                    position: 'absolute',
                                                    width: '100%',
                                                    height: '100%',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: '#1a1a1a',
                                                    color: '#0ADAF5',
                                                    fontSize: '48px'
                                                }}
                                            >
                                                <FaImage />
                                            </div>
                                            {esMiPerfil && (
                                                <button
                                                    type="button"
                                                    className="sc-galeria-borrar-btn"
                                                    title="Eliminar imagen"
                                                    onClick={() => handleBorrarFoto(foto.id)}
                                                >×</button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="sc-empty">
                                    {esMiPerfil ? "Sube tus fotos mezclando para mostrarlas aquí." : "Sin imágenes en la galería."}
                                </p>
                            )}
                        </section>
                    )}

                </div>

                <aside className="sc-sidebar-col">
                    <div className="sc-stats-bar">
                        <div className="sc-stat"><span>Seguidores</span><strong>{seguidores?.length || 0}</strong></div>
                        <div className="sc-stat"><span>Siguiendo</span><strong>{seguidos?.length || 0}</strong></div>
                        <div className="sc-stat"><span>Tracks</span><strong>{cancionesDelUsuario?.length || 0}</strong></div>
                        <div className="sc-stat"><span>Reproducciones</span><strong>{totalReproducciones.toLocaleString("es-ES")}</strong></div>
                    </div>

                    {/* --- MI SET UP: HARDWARE --- */}
                    <section className="sc-section sc-gear-section">
                        <h3 className="sc-section-title">Hardware</h3>
                        {hardwares && hardwares.length > 0 ? (
                            <ul className="sc-gear-list">
                                {hardwares.map(hw => {
                                    const imagenUrl = obtenerImagen(hw.imagen) || PortadaPorDefecto;
                                    return (
                                    <li key={hw.id} className="sc-gear-item">
                                        <Link to={`/mostrar/hardware/${hw.id}`} className="sc-gear-link">
                                            <img
                                                src={imagenUrl}
                                                alt={hw.nombre}
                                                className="sc-gear-thumb"
                                                onError={(e) => (e.target.src = PortadaPorDefecto)}
                                            />
                                            <span className="sc-gear-text">
                                                <span className="sc-gear-name">
                                                    {hw.nombre}
                                                    {hw?.pivot?.cantidad > 1 && (
                                                        <span className="sc-gear-cantidad">×{hw.pivot.cantidad}</span>
                                                    )}
                                                </span>
                                                {hw.marca && <span className="sc-gear-sub">{hw.marca}</span>}
                                            </span>
                                        </Link>
                                        {esMiPerfil && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '12px',
                                                    right: '12px',
                                                    display: 'flex',
                                                    gap: '6px',
                                                    zIndex: 10
                                                }}
                                            >
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEliminarRapido('hardware', hw.id, hw.nombre); }}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: '#999',
                                                        fontSize: '18px',
                                                        transition: 'color 0.2s, transform 0.2s',
                                                        pointerEvents: 'auto',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '4px'
                                                    }}
                                                    onMouseEnter={(e) => { e.target.style.color = '#ff6b6b'; e.target.style.backgroundColor = 'rgba(0,0,0,0.4)'; e.target.style.transform = 'scale(1.1)'; }}
                                                    onMouseLeave={(e) => { e.target.style.color = '#999'; e.target.style.backgroundColor = 'transparent'; e.target.style.transform = 'scale(1)'; }}
                                                    title="Desvincular hardware"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="sc-empty">Sin hardware vinculado.</p>
                        )}
                    </section>

                    {/* --- MI SET UP: SOFTWARE --- */}
                    <section className="sc-section sc-gear-section">
                        <h3 className="sc-section-title">Software</h3>
                        {softwares && softwares.length > 0 ? (
                            <ul className="sc-gear-list">
                                {softwares.map(sw => {
                                    const imagenUrl = obtenerImagen(sw.imagen) || PortadaPorDefecto;
                                    return (
                                    <li key={sw.id} className="sc-gear-item">
                                        <Link to={`/mostrar/software/${sw.id}`} className="sc-gear-link">
                                            <img
                                                src={imagenUrl}
                                                alt={sw.nombre}
                                                className="sc-gear-thumb"
                                                onError={(e) => (e.target.src = PortadaPorDefecto)}
                                            />
                                            <span className="sc-gear-text">
                                                <span className="sc-gear-name">{sw.nombre}</span>
                                                {sw.distribuidor && <span className="sc-gear-sub">{sw.distribuidor}</span>}
                                            </span>
                                        </Link>
                                        {esMiPerfil && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '12px',
                                                    right: '12px',
                                                    display: 'flex',
                                                    gap: '6px',
                                                    zIndex: 10
                                                }}
                                            >
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEliminarRapido('software', sw.id, sw.nombre); }}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: '#999',
                                                        fontSize: '18px',
                                                        transition: 'color 0.2s, transform 0.2s',
                                                        pointerEvents: 'auto',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '4px'
                                                    }}
                                                    onMouseEnter={(e) => { e.target.style.color = '#ff6b6b'; e.target.style.backgroundColor = 'rgba(0,0,0,0.4)'; e.target.style.transform = 'scale(1.1)'; }}
                                                    onMouseLeave={(e) => { e.target.style.color = '#999'; e.target.style.backgroundColor = 'transparent'; e.target.style.transform = 'scale(1)'; }}
                                                    title="Desvincular software"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="sc-empty">Sin software vinculado.</p>
                        )}
                    </section>

                    {/* --- EVENTOS --- */}
                    <section className="sc-section sc-gear-section">
                        <h3 className="sc-section-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><FaMicrophone size={20} /> Eventos</h3>
                        {eventos && eventos.length > 0 ? (
                            <ul className="sc-gear-list">
                                {eventos.map(evento => (
                                    <li key={evento.id} className="sc-gear-item">
                                        <Link to={`/mostrar/evento/${evento.id}`} className="sc-gear-link">
                                            <img
                                                src={obtenerImagen(evento.imagen) || PortadaPorDefecto}
                                                alt={evento.nombre}
                                                className="sc-gear-thumb"
                                                onError={(e) => (e.target.src = PortadaPorDefecto)}
                                            />
                                            <span className="sc-gear-text">
                                                <span className="sc-gear-name">{evento.nombre}</span>
                                                {evento.nombre_sala && <span className="sc-gear-sub sc-evento-sala">{evento.nombre_sala}</span>}
                                            </span>
                                        </Link>
                                        {esMiPerfil && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '12px',
                                                    right: '12px',
                                                    display: 'flex',
                                                    gap: '6px',
                                                    zIndex: 10
                                                }}
                                            >
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); abrirEdicion(e, 'evento', evento); }}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: '#999',
                                                        fontSize: '18px',
                                                        transition: 'color 0.2s, transform 0.2s',
                                                        pointerEvents: 'auto',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '4px'
                                                    }}
                                                    onMouseEnter={(e) => { e.target.style.color = '#ccc'; e.target.style.backgroundColor = 'rgba(0,0,0,0.4)'; e.target.style.transform = 'scale(1.1)'; }}
                                                    onMouseLeave={(e) => { e.target.style.color = '#999'; e.target.style.backgroundColor = 'transparent'; e.target.style.transform = 'scale(1)'; }}
                                                    title="Editar evento"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEliminarElemento('evento', evento.id, evento.nombre, 'Evento'); }}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: '#999',
                                                        fontSize: '18px',
                                                        transition: 'color 0.2s, transform 0.2s',
                                                        pointerEvents: 'auto',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '4px'
                                                    }}
                                                    onMouseEnter={(e) => { e.target.style.color = '#ff6b6b'; e.target.style.backgroundColor = 'rgba(0,0,0,0.4)'; e.target.style.transform = 'scale(1.1)'; }}
                                                    onMouseLeave={(e) => { e.target.style.color = '#999'; e.target.style.backgroundColor = 'transparent'; e.target.style.transform = 'scale(1)'; }}
                                                    title="Eliminar evento"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="sc-empty">Sin eventos organizados.</p>
                        )}
                    </section>

                </aside>
            </div>

            {modalAbierto && esMiPerfil && (
                <div
                    className="modal-subida-overlay"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setModalAbierto(null);
                            setDatosEdicion(null);
                        }
                    }}
                >
                    <div className="modal-subida-contenido">
                        {modalAbierto === 'editar-perfil' && <EditarPerfil datosActuales={datosUsuario} alFinalizar={manejarExito} />}
                        {modalAbierto === 'setup' && <GestionarEquipamiento alFinalizar={manejarExito} hardwaresActuales={hardwares} softwaresActuales={softwares} />}
                        {modalAbierto === 'cancion' && <SubirCancion alFinalizar={manejarExito} misColecciones={coleccionesDelUsuario} misPlaylists={playlists} datosAEditar={datosEdicion} />}
                        {modalAbierto === 'coleccion' && <SubirColeccion alFinalizar={manejarExito} datosAEditar={datosEdicion} />}
                        {modalAbierto === 'playlist' && <SubirPlaylist alFinalizar={manejarExito} datosAEditar={datosEdicion} />}
                        {modalAbierto === 'evento' && <SubirEvento alFinalizar={manejarExito} datosAEditar={datosEdicion} />}
                    </div>
                </div>
            )}

            {/* --- LIGHTBOX DE GALERÍA --- */}
            {lightboxImg && (
                <div className="sc-lightbox-overlay" onClick={() => setLightboxImg(null)}>
                    <button className="sc-lightbox-close" onClick={() => setLightboxImg(null)} aria-label="Cerrar">×</button>
                    <img
                        src={lightboxImg}
                        alt="Imagen ampliada"
                        className="sc-lightbox-img"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default DetallesUsuario;