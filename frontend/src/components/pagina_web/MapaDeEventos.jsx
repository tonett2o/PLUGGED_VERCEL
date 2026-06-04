import React, { useState, useContext, useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { contextoEvento } from '../../contexts/ProveedorEvento.jsx';
import Evento from '../componentes_principales/Evento.jsx';
import { Link } from 'react-router-dom';
import './MapaDeEventos.css';

// Fijar el icono de leaflet (problema común)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para centrar el mapa en un evento
const CentrarMapa = ({ lat, lng }) => {
    const mapa = useMap();
    useEffect(() => {
        if (lat && lng) {
            mapa.setView([lat, lng], 13);
        }
    }, [lat, lng, mapa]);
    return null;
};

const MapaDeEventos = () => {
    const { listaEventos, loadingEventos } = useContext(contextoEvento);
    const [busqueda, setBusqueda] = useState('');
    const [estilosSeleccionados, setEstilosSeleccionados] = useState([]);
    const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
    const sidebarRef = useRef(null);

    // Extraer todos los estilos únicos
    const estilosDisponibles = useMemo(() => {
        const todosLosEstilos = new Map();
        listaEventos.forEach(evento => {
            if (evento.estilos && Array.isArray(evento.estilos)) {
                evento.estilos.forEach(estilo => {
                    if (!todosLosEstilos.has(estilo.id)) {
                        todosLosEstilos.set(estilo.id, estilo);
                    }
                });
            }
        });
        return Array.from(todosLosEstilos.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
    }, [listaEventos]);

    // Filtrar eventos
    const eventosFiltrados = useMemo(() => {
        return listaEventos.filter(evento => {
            const coincideBusqueda =
                evento.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                evento.nombre_sala?.toLowerCase().includes(busqueda.toLowerCase()) ||
                evento.ubicacion?.toLowerCase().includes(busqueda.toLowerCase());

            let coincideEstilo = true;
            if (estilosSeleccionados.length > 0) {
                coincideEstilo = evento.estilos?.some(estilo =>
                    estilosSeleccionados.includes(estilo.id)
                );
            }

            return coincideBusqueda && coincideEstilo;
        });
    }, [listaEventos, busqueda, estilosSeleccionados]);

    const toggleEstilo = (estiloId) => {
        setEstilosSeleccionados(prev =>
            prev.includes(estiloId)
                ? prev.filter(id => id !== estiloId)
                : [...prev, estiloId]
        );
    };

    const limpiarFiltros = () => {
        setBusqueda('');
        setEstilosSeleccionados([]);
        setEventoSeleccionado(null);
    };

    // Calcular centro del mapa (promedio de todas las coordenadas)
    const centerMapa = useMemo(() => {
        if (eventosFiltrados.length === 0) return [40.4168, -3.7038]; // Madrid por defecto

        const lats = eventosFiltrados
            .filter(e => e.latitud && e.longitud)
            .map(e => parseFloat(e.latitud));
        const lngs = eventosFiltrados
            .filter(e => e.latitud && e.longitud)
            .map(e => parseFloat(e.longitud));

        if (lats.length === 0) return [40.4168, -3.7038];

        const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
        const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
        return [avgLat, avgLng];
    }, [eventosFiltrados]);

    const handleEventoEnLista = (evento) => {
        setEventoSeleccionado(evento.id);
        // Scroll al evento en la lista
        setTimeout(() => {
            const elem = document.getElementById(`evento-${evento.id}`);
            if (elem && sidebarRef.current) {
                elem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 100);
    };

    return (
        <div className="mapa-eventos-page-v3">
            {/* Mapa a la izquierda */}
            <div className="mapa-container-v3">
                {loadingEventos ? (
                    <div className="mapa-loading-overlay">
                        <p>Cargando eventos...</p>
                    </div>
                ) : (
                    <MapContainer
                        center={centerMapa}
                        zoom={6}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <CentrarMapa lat={eventoSeleccionado ? eventosFiltrados.find(e => e.id === eventoSeleccionado)?.latitud : null} lng={eventoSeleccionado ? eventosFiltrados.find(e => e.id === eventoSeleccionado)?.longitud : null} />

                        {eventosFiltrados.map(evento => {
                            if (!evento.latitud || !evento.longitud) return null;

                            return (
                                <Marker
                                    key={evento.id}
                                    position={[parseFloat(evento.latitud), parseFloat(evento.longitud)]}
                                    eventHandlers={{
                                        click: () => handleEventoEnLista(evento),
                                    }}
                                >
                                    <Popup>
                                        <div className="popup-evento">
                                            <strong>{evento.nombre}</strong>
                                            <p className="popup-sala">{evento.nombre_sala}</p>
                                            <Link to={`/mostrar/evento/${evento.id}`} className="popup-link">
                                                Ver detalles →
                                            </Link>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                )}
            </div>

            {/* Sidebar a la derecha */}
            <div className="sidebar-v3" ref={sidebarRef}>
                <div className="sidebar-header">
                    <h1>🎵 Eventos</h1>
                </div>

                {/* Buscador */}
                <div className="sidebar-search">
                    <input
                        type="text"
                        placeholder="Buscar evento..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="sidebar-search-input"
                    />
                </div>

                {/* Filtros */}
                <div className="sidebar-filters">
                    <div className="sidebar-filters-header">
                        <h3>Estilos</h3>
                        {(busqueda || estilosSeleccionados.length > 0) && (
                            <button
                                className="sidebar-clear-btn"
                                onClick={limpiarFiltros}
                            >
                                Limpiar
                            </button>
                        )}
                    </div>

                    <div className="sidebar-filters-grid">
                        {estilosDisponibles.map(estilo => (
                            <label key={estilo.id} className="sidebar-filter-item">
                                <input
                                    type="checkbox"
                                    checked={estilosSeleccionados.includes(estilo.id)}
                                    onChange={() => toggleEstilo(estilo.id)}
                                />
                                <span
                                    className="filter-tag"
                                    style={{
                                        backgroundColor: estilosSeleccionados.includes(estilo.id)
                                            ? estilo.color
                                            : 'transparent',
                                        borderColor: estilo.color,
                                        color: estilosSeleccionados.includes(estilo.id) ? '#000' : '#fff'
                                    }}
                                >
                                    {estilo.nombre}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Lista de eventos */}
                <div className="sidebar-eventos-list">
                    <div className="sidebar-list-header">
                        <p className="sidebar-count">
                            {eventosFiltrados.length} evento{eventosFiltrados.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {eventosFiltrados.length > 0 ? (
                        <div className="sidebar-items">
                            {eventosFiltrados.map(evento => (
                                <div
                                    key={evento.id}
                                    id={`evento-${evento.id}`}
                                    className={`sidebar-evento-item ${eventoSeleccionado === evento.id ? 'active' : ''}`}
                                    onClick={() => handleEventoEnLista(evento)}
                                >
                                    <div className="sidebar-evento-image">
                                        <img
                                            src={evento.imagen}
                                            alt={evento.nombre}
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/80?text=No+image';
                                            }}
                                        />
                                    </div>
                                    <div className="sidebar-evento-info">
                                        <h4 className="sidebar-evento-nombre">{evento.nombre}</h4>
                                        <p className="sidebar-evento-sala">{evento.nombre_sala}</p>
                                        {evento.estilos && evento.estilos.length > 0 && (
                                            <div className="sidebar-evento-estilos">
                                                {evento.estilos.slice(0, 2).map(estilo => (
                                                    <span
                                                        key={estilo.id}
                                                        className="mini-tag"
                                                        style={{ backgroundColor: estilo.color, color: '#000' }}
                                                    >
                                                        {estilo.nombre}
                                                    </span>
                                                ))}
                                                {evento.estilos.length > 2 && (
                                                    <span className="mini-tag-more">+{evento.estilos.length - 2}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="sidebar-empty">
                            <p>No hay eventos que coincidan</p>
                            <button className="sidebar-reset-btn" onClick={limpiarFiltros}>
                                Resetear
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MapaDeEventos;
