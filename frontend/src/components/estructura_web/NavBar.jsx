import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaSearch, FaUser, FaMusic, FaCompactDisc, FaListUl, FaUsers } from 'react-icons/fa';
import { useAuth } from '../../contexts/ProveedorAuth';
import useApiLogout from '../../hooks/Auth/useApiLogout.js';
import useSearch from '../../hooks/Search/useSearch.js';
import './NavBar.css';
import AvatarPorDefecto from '../../assets/user-default.jpg';
import Logo from '../../assets/logobueno.jpg';

export const NavBar = () => {
    const { usuario, autenticado, desconectar } = useAuth();
    const navigate = useNavigate();
    const [busqueda, setBusqueda] = useState('');
    const [resultados, setResultados] = useState({ artistas: [], canciones: [], colecciones: [], playlists: [] });
    const [mostrarResultados, setMostrarResultados] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [amigos, setAmigos] = useState([]);
    const timeoutRef = useRef(null);

    /**
     * Maneja la búsqueda con debounce
     */
    useEffect(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (busqueda.trim().length < 2) {
            setResultados({ artistas: [], canciones: [], colecciones: [], playlists: [] });
            setMostrarResultados(false);
            return;
        }

        setCargando(true);
        timeoutRef.current = setTimeout(async () => {
            const res = await useSearch(busqueda);
            setResultados(res);
            setMostrarResultados(true);
            setCargando(false);
        }, 300);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [busqueda]);

    /**
     * Obtiene los amigos del usuario autenticado
     */
    useEffect(() => {
        if (autenticado && usuario?.id) {
            const obtenerAmigos = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                    const response = await fetch(`/api/usuarios/${usuario.id}/amigos`, { headers });
                    if (response.ok) {
                        const data = await response.json();
                        setAmigos(Array.isArray(data) ? data : []);
                    }
                } catch (error) {
                    console.error('Error al obtener amigos:', error);
                    setAmigos([]);
                }
            };
            obtenerAmigos();
        }
    }, [autenticado, usuario?.id]);

    /**
     * Navega a un resultado y cierra el dropdown
     */
    const handleNavegar = (tipo, id) => {
        setMostrarResultados(false);
        setBusqueda('');
        navigate(`/mostrar/${tipo}/${id}`);
    };

    /**
     * Gestiona el cierre de sesión
     */
    const handleLogout = async () => {
        // 1. Llamamos al hook que usa Axios para avisar a Laravel
        // (Axios enviará el token automáticamente gracias al interceptor)
        await useApiLogout();

        // 2. Limpiamos el estado global y el localStorage en React
        desconectar();

        // 3. Redirigimos al usuario a la página de inicio o login
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                {/* Lado Izquierdo: Logo o Enlaces principales */}
                <div className="nav-brand">
                    <Link to="/" className="nav-logo">
                        <img src={Logo} alt="PLUGGED Logo" className="nav-logo-img" />
                    </Link>
                </div>

                <div className="nav-menu">
                    <Link to="/">Inicio</Link>
                    <Link to="/explorar">Explorar</Link>
                    <Link to="/eventos">Eventos</Link>
                </div>

                {/* Buscador */}
                <div className="nav-search-container">
                    <div className="nav-search-wrapper">
                        <FaSearch className="nav-search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar artistas, canciones, álbumes..."
                            className="nav-search-input"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            onFocus={() => busqueda.length >= 2 && setMostrarResultados(true)}
                        />
                        {busqueda && (
                            <button
                                className="nav-search-clear"
                                onClick={() => setBusqueda('')}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Dropdown de resultados */}
                    {mostrarResultados && (
                        <div className="nav-search-results">
                            {cargando ? (
                                <div className="nav-search-loading">Buscando...</div>
                            ) : (resultados.artistas.length + resultados.canciones.length + resultados.colecciones.length + resultados.playlists.length) > 0 ? (
                                <>
                                    {resultados.artistas.length > 0 && (
                                        <div className="nav-search-category">
                                            <h4>Artistas</h4>
                                            {resultados.artistas.map(artista => (
                                                <button
                                                    key={`artista-${artista.id}`}
                                                    className="nav-search-item"
                                                    onClick={() => handleNavegar('usuario', artista.id)}
                                                >
                                                    <div className="nav-search-item-avatar">
                                                        {artista.avatar ? (
                                                            <img
                                                                src={artista.avatar}
                                                                alt={artista.nick}
                                                                onError={(e) => (e.target.src = AvatarPorDefecto)}
                                                            />
                                                        ) : (
                                                            <FaUser className="nav-search-item-icon" />
                                                        )}
                                                    </div>
                                                    <div className="nav-search-item-content">
                                                        <div className="nav-search-item-title">{artista.nick}</div>
                                                        <div className="nav-search-item-subtitle">{artista.nombre}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {resultados.canciones.length > 0 && (
                                        <div className="nav-search-category">
                                            <h4>Canciones</h4>
                                            {resultados.canciones.map(cancion => (
                                                <button
                                                    key={`cancion-${cancion.id}`}
                                                    className="nav-search-item"
                                                    onClick={() => handleNavegar('cancion', cancion.id)}
                                                >
                                                    <div className="nav-search-item-cover">
                                                        {cancion.portada ? (
                                                            <img
                                                                src={cancion.portada}
                                                                alt={cancion.titulo}
                                                                onError={(e) => (e.target.src = AvatarPorDefecto)}
                                                            />
                                                        ) : (
                                                            <FaMusic className="nav-search-item-icon" />
                                                        )}
                                                    </div>
                                                    <div className="nav-search-item-content">
                                                        <div className="nav-search-item-title">{cancion.titulo}</div>
                                                        <div className="nav-search-item-subtitle">{cancion.usuario?.nombre || cancion.usuario?.nick || 'Artista desconocido'}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {resultados.colecciones.length > 0 && (
                                        <div className="nav-search-category">
                                            <h4>Álbumes & EPs</h4>
                                            {resultados.colecciones.map(coleccion => (
                                                <button
                                                    key={`coleccion-${coleccion.id}`}
                                                    className="nav-search-item"
                                                    onClick={() => handleNavegar('coleccion', coleccion.id)}
                                                >
                                                    <div className="nav-search-item-cover">
                                                        {coleccion.portada ? (
                                                            <img
                                                                src={coleccion.portada}
                                                                alt={coleccion.titulo}
                                                                onError={(e) => (e.target.src = AvatarPorDefecto)}
                                                            />
                                                        ) : (
                                                            <FaCompactDisc className="nav-search-item-icon" />
                                                        )}
                                                    </div>
                                                    <div className="nav-search-item-content">
                                                        <div className="nav-search-item-title">{coleccion.titulo}</div>
                                                        <div className="nav-search-item-subtitle">{coleccion.usuario?.nombre || coleccion.usuario?.nick || coleccion.artista || 'Artista desconocido'}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {resultados.playlists.length > 0 && (
                                        <div className="nav-search-category">
                                            <h4>Playlists</h4>
                                            {resultados.playlists.map(playlist => (
                                                <button
                                                    key={`playlist-${playlist.id}`}
                                                    className="nav-search-item"
                                                    onClick={() => handleNavegar('playlist', playlist.id)}
                                                >
                                                    <div className="nav-search-item-cover">
                                                        {playlist.portada ? (
                                                            <img
                                                                src={playlist.portada}
                                                                alt={playlist.titulo}
                                                                onError={(e) => (e.target.src = AvatarPorDefecto)}
                                                            />
                                                        ) : (
                                                            <FaListUl className="nav-search-item-icon" />
                                                        )}
                                                    </div>
                                                    <div className="nav-search-item-content">
                                                        <div className="nav-search-item-title">{playlist.titulo}</div>
                                                        <div className="nav-search-item-subtitle">{playlist.usuario?.nombre || playlist.usuario?.nick || playlist.artista || 'Creador desconocido'}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="nav-search-empty">No se encontraron resultados</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Lado Derecho: Autenticación */}
                <div className="nav-auth">
                    {autenticado ? (
                        <div className="nav-user-info">
                            {/* Botón de amigos - A la izquierda del avatar */}
                            <Link
                                to={`/amigos/${usuario.id}`}
                                className="nav-amigos-link"
                                title={`Amigos (${amigos.length})`}
                            >
                                <FaUsers size={18} />
                                {amigos.length > 0 && <span className="nav-amigos-badge">{amigos.length}</span>}
                            </Link>

                            <Link to={`/mostrar/usuario/${usuario.id}`} className="nav-profile-link">
                                <img
                                    src={`${usuario.avatar}?t=${Date.now()}`}
                                    alt={`Avatar de ${usuario.nick}`}
                                    className="nav-avatar"
                                    onError={(e) => (e.target.src = AvatarPorDefecto)}
                                    key={usuario.avatar}
                                />
                            </Link>

                            <span className="nav-username">{usuario.nick}</span>

                            <button
                                onClick={handleLogout}
                                className="btn-logout"
                                title="Cerrar sesión"
                            >
                                <FaSignOutAlt size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="nav-auth-links">
                            {/* Si no está logueado, mostramos botones de acceso */}
                            <Link to="/login" className="btn-login-link">
                                Iniciar Sesión
                            </Link>
                            <Link to="/registro" className="btn-register-link">
                                <button className="btn-register-action">Registrarse</button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};