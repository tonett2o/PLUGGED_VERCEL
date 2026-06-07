import React, { useState, useContext, useMemo, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { contextoEvento } from '../../contexts/ProveedorEvento.jsx';
import { Link } from 'react-router-dom';
import { FaMapPin, FaMusic, FaCalendarAlt, FaArrowRight, FaMusic as FaMusic2 } from 'react-icons/fa';
import { generarPortadaPlaceholder } from '../../utils/imagen.js';
import './ExplorarEventos.css';

const ExplorarEventos = () => {
    const { listaEventos, loadingEventos } = useContext(contextoEvento);
    const [busqueda, setBusqueda] = useState('');
    const [estilosSeleccionados, setEstilosSeleccionados] = useState([]);
    const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markers = useRef({});
    const listContainer = useRef(null);

    // Extraer todos los estilos únicos (solo de eventos públicos)
    const estilosDisponibles = useMemo(() => {
        const todosLosEstilos = new Map();
        listaEventos
            .filter(evento => !evento.privacidad || evento.privacidad === 'publica')
            .forEach(evento => {
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

    // Filtrar eventos (solo públicos)
    const eventosFiltrados = useMemo(() => {
        return listaEventos.filter(evento => {
            // Solo mostrar eventos públicos
            if (evento.privacidad && evento.privacidad !== 'publica') {
                return false;
            }

            const searchTerm = busqueda.toLowerCase();

            // Buscar en nombre y sala
            const coincideBusqueda =
                evento.nombre?.toLowerCase().includes(searchTerm) ||
                evento.nombre_sala?.toLowerCase().includes(searchTerm) ||
                (typeof evento.ubicacion === 'object'
                    ? evento.ubicacion?.direccion?.toLowerCase().includes(searchTerm)
                    : evento.ubicacion?.toLowerCase().includes(searchTerm));

            let coincideEstilo = true;
            if (estilosSeleccionados.length > 0) {
                coincideEstilo = evento.estilos?.some(estilo =>
                    estilosSeleccionados.includes(estilo.id)
                );
            }

            return coincideBusqueda && coincideEstilo;
        });
    }, [listaEventos, busqueda, estilosSeleccionados]);

    // Inicializar mapa
    useEffect(() => {
        if (!mapContainer.current || loadingEventos) return;

        if (map.current) {
            return;
        }

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
            center: [2.35, 40.4],
            zoom: 5,
            pitch: 0,
            bearing: 0
        });

        map.current.addControl(new maplibregl.NavigationControl());
    }, [loadingEventos]);

    // Actualizar marcadores cuando cambian los eventos filtrados
    useEffect(() => {
        if (!map.current || loadingEventos) return;

        // Limpiar marcadores anteriores
        Object.values(markers.current).forEach(marker => marker.remove());
        markers.current = {};

        // Agregar nuevos marcadores
        eventosFiltrados.forEach(evento => {
            // Las coordenadas están dentro de ubicacion
            const lat = evento.ubicacion?.lat || evento.latitud;
            const lng = evento.ubicacion?.lng || evento.longitud;

            if (!lat || !lng) {
                console.warn('⚠️ Evento sin coordenadas:', evento.nombre);
                return;
            }


            const el = document.createElement('div');
            el.className = 'marker';
            el.style.cursor = 'pointer';
            el.style.userSelect = 'none';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.style.width = '40px';
            el.style.height = '40px';
            el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))';

            // Crear SVG del marcador
            el.innerHTML = `
                <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 0C7.16 0 0 7.16 0 16C0 26 16 40 16 40S32 26 32 16C32 7.16 24.84 0 16 0Z" fill="#0ADAF5"/>
                    <circle cx="16" cy="16" r="6" fill="#fff"/>
                </svg>
            `;

            el.addEventListener('mouseenter', () => {
                el.style.filter = 'drop-shadow(0 4px 8px rgba(10, 218, 245, 0.6)) drop-shadow(0 0 8px rgba(10, 218, 245, 0.4))';
            });

            el.addEventListener('mouseleave', () => {
                el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))';
            });

            // Crear popup con imagen correcta
            const imagenUrl = evento.imagen?.startsWith('http')
                ? evento.imagen
                : `/storage/${evento.imagen}`;

            const popup = new maplibregl.Popup({
                offset: [30, 0],
                closeButton: true,
                closeOnClick: false,
                anchor: 'left'
            }).setHTML(`
                <div class="evento-popup">
                    <img src="${imagenUrl}" alt="${evento.nombre}" class="popup-image" onerror="this.src='https://via.placeholder.com/250?text=Sin+imagen'" />
                    <div class="popup-content">
                        <h4>${evento.nombre}</h4>
                        <p class="popup-sala">📍 <strong>${evento.nombre_sala || 'Sin ubicación'}</strong></p>
                        ${evento.fecha_evento ? `<p class="popup-fecha">📅 ${new Date(evento.fecha_evento).toLocaleDateString('es-ES')}</p>` : ''}
                        <a href="/mostrar/evento/${evento.id}" class="popup-link" onclick="window.location.href=this.href; return false;">Ver detalles</a>
                    </div>
                </div>
            `);

            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([parseFloat(lng), parseFloat(lat)])
                .setPopup(popup)
                .addTo(map.current);

            el.addEventListener('click', () => {
                setEventoSeleccionado(evento.id);
                marker.togglePopup();
            });

            markers.current[evento.id] = marker;
        });


        // Ajustar zoom a eventos
        if (eventosFiltrados.length > 0) {
            const lats = eventosFiltrados.filter(e => e.ubicacion?.lat || e.latitud).map(e => parseFloat(e.ubicacion?.lat || e.latitud));
            const lngs = eventosFiltrados.filter(e => e.ubicacion?.lng || e.longitud).map(e => parseFloat(e.ubicacion?.lng || e.longitud));

            if (lats.length > 0) {
                const minLat = Math.min(...lats);
                const maxLat = Math.max(...lats);
                const minLng = Math.min(...lngs);
                const maxLng = Math.max(...lngs);

                map.current.fitBounds(
                    [[minLng, minLat], [maxLng, maxLat]],
                    { padding: 50, maxZoom: 12 }
                );
            }
        }
    }, [eventosFiltrados, loadingEventos]);

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

    // Scroll automático al evento seleccionado en la lista
    useEffect(() => {
        if (eventoSeleccionado && listContainer.current) {
            const eventoElemento = listContainer.current.querySelector(
                `[data-evento-id="${eventoSeleccionado}"]`
            );
            if (eventoElemento) {
                eventoElemento.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }
        }
    }, [eventoSeleccionado]);

    return (
        <div className="explorar-eventos-page">
            <div className="explorar-container">
                {/* MAPA - Lado Izquierdo */}
                <div className="mapa-section">
                    {loadingEventos ? (
                        <div className="mapa-loading">
                            <p>Cargando mapa y eventos...</p>
                        </div>
                    ) : (
                        <>
                            <div className="mapa-embed" ref={mapContainer}></div>
                            <div className="mapa-info">
                                <p className="mapa-marker-count">
                                    <FaMapPin style={{ marginRight: '8px' }} />
                                    {eventosFiltrados.length} evento{eventosFiltrados.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* SIDEBAR - Lado Derecho */}
                <div className="sidebar-section">
                    <div className="sidebar-header">
                        <h1><FaMusic2 style={{ marginRight: '8px' }} /> Explorar Eventos</h1>
                        <p className="sidebar-subtitle">Descubre eventos musicales</p>
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

                        {loadingEventos ? (
                            <div className="sidebar-loading">
                                <p>Cargando eventos...</p>
                            </div>
                        ) : eventosFiltrados.length > 0 ? (
                            <div className="sidebar-items" ref={listContainer}>
                                {eventosFiltrados.map(evento => (
                                    <Link
                                        key={evento.id}
                                        data-evento-id={evento.id}
                                        to={`/mostrar/evento/${evento.id}`}
                                        className={`sidebar-evento-item ${eventoSeleccionado === evento.id ? 'active' : ''}`}
                                        onClick={() => setEventoSeleccionado(evento.id)}
                                    >
                                        <div className="sidebar-evento-image">
                                            {evento.imagen ? (
                                                <img
                                                    src={evento.imagen?.startsWith('http') ? evento.imagen : `/storage/${evento.imagen}`}
                                                    alt={evento.nombre}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const parent = e.target.parentElement;
                                                        const fallback = parent.querySelector('.evento-gradient-fallback');
                                                        if (fallback) fallback.style.display = 'block';
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className="evento-gradient-fallback"
                                                style={{
                                                    backgroundImage: `url(${generarPortadaPlaceholder(evento.nombre || 'Evento')})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    width: '100%',
                                                    height: '100%',
                                                    borderRadius: '4px',
                                                    display: evento.imagen ? 'none' : 'block'
                                                }}
                                            />
                                        </div>
                                        <div className="sidebar-evento-info">
                                            <h4 className="sidebar-evento-nombre">{evento.nombre}</h4>
                                            <p className="sidebar-evento-sala">{evento.nombre_sala}</p>
                                            {evento.fecha_evento && (
                                                <p className="sidebar-evento-fecha">
                                                    <FaCalendarAlt style={{ marginRight: '6px' }} />
                                                    {new Date(evento.fecha_evento).toLocaleDateString('es-ES')}
                                                </p>
                                            )}
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
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="sidebar-empty">
                                <p>No hay eventos que coincidan</p>
                                <button className="sidebar-reset-btn" onClick={limpiarFiltros}>
                                    Resetear búsqueda
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExplorarEventos;
