/**
 * NavBar.jsx - Barra de navegacion superior global
 *
 * Componente persistente visible en todas las rutas. Contiene:
 *   - Logo de la aplicacion (enlace a inicio)
 *   - Menu de navegacion principal (Inicio, Explorar, Eventos)
 *   - Buscador global con dropdown de resultados en tiempo real
 *   - Zona de autenticacion (avatar + nick + logout si logueado, o botones de acceso)
 *   - Boton de amigos con badge de conteo
 *
 * El buscador aplica debounce de 300ms para no saturar la API con cada
 * pulsacion de tecla. Se activa a partir de 2 caracteres.
 *
 * La lista de amigos se carga una vez cuando el usuario se autentica
 * y se muestra como badge sobre el icono de amigos.
 */
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

    // Estado del buscador
    const [busqueda, setBusqueda] = useState('');
    const [resultados, setResultados] = useState({ artistas: [], canciones: [], colecciones: [], playlists: [] });
    const [mostrarResultados, setMostrarResultados] = useState(false);
    const [cargando, setCargando] = useState(false);

    // Lista de amigos para el badge
    const [amigos, setAmigos] = useState([]);

    // Referencia para el temporizador del debounce
    const timeoutRef = useRef(null);

    /**
     * Debounce del buscador: espera 300ms tras la ultima pulsacion antes
     * de hacer la peticion a la API. Cancela la peticion anterior si el
     * usuario sigue escribiendo. Se resetea si la busqueda tiene menos de 2 chars.
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
     * Carga la lista de amigos del usuario autenticado al iniciar sesion.
     * Solo se ejecuta si hay usuario y su ID esta disponible.
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
     * Navega a la pagina de detalle del resultado seleccionado y cierra el dropdown.
     *
     * @param {string} tipo - Tipo de entidad ('usuario', 'cancion', 'coleccion', 'playlist')
     * @param {number} id   - ID de la entidad
     */
    const handleNavegar = (tipo, id) => {
        setMostrarResultados(false);
        setBusqueda('');
        navigate(`/mostrar/${tipo}/${id}`);
    };

    /**
     * Gestiona el cierre de sesion en tres pasos:
     *   1. Notifica al backend para invalidar el token (via Axios con interceptor)
     *   2. Limpia el estado global de React y el localStorage
     *   3. Redirige al formulario de login
     */
    const handleLogout = async () => {
        await useApiLogout();
        desconectar();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                {/* Lado izquierdo: logo */}
                <div className="nav-brand">
                    <Link to="/" className="nav-logo">
                        <img src={Logo} alt="PLUGGED Logo" className="nav-logo-img" />
                    </Link>
                </div>

                {/* Menu de navegacion principal */}
                <div className="nav-menu">
                    <Link to="/">Inicio</Link>
                    <Link to="/explorar">Explorar</Link>
                    <Link to="/eventos">Eventos</Link>
                </div>

                {/* Buscador global con dropdown de resultados */}
                <div className="nav-search-container">
                    <div className="nav-search-wrapper">
                        <FaSearch className="nav-search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar artistas, canciones, albumes..."
                            className="nav-search-input"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            onFocus={() => busqueda.length >= 2 && setMostrarResultados(true)}
                        />
                        {/* Boton para limpiar la busqueda */}
                        {busqueda && (
                            <button
                                className="nav-search-clear"
                                onClick={() => setBusqueda('')}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Dropdown de resultados: artistas, canciones, colecciones, playlists */}
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
                                            <h4>Albums & EPs</h4>
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

                {/* Lado derecho: zona de autenticacion */}
                <div className="nav-auth">
                    {autenticado ? (
                        <div className="nav-user-info">
                            {/* Enlace a amigos con badge del conteo actual */}
                            <Link
                                to={`/amigos/${usuario.id}`}
                                className="nav-amigos-link"
                                title={`Amigos (${amigos.length})`}
                            >
                                <FaUsers size={18} />
                                {amigos.length > 0 && <span className="nav-amigos-badge">{amigos.length}</span>}
                            </Link>

                            {/* Avatar del usuario: navega a su perfil */}
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
                                title="Cerrar sesion"
                            >
                                <FaSignOutAlt size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="nav-auth-links">
                            {/* Si no hay sesion, mostrar accesos de entrada */}
                            <Link to="/login" className="btn-login-link">
                                Iniciar Sesion
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
