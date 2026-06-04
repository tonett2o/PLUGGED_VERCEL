import React, { useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import API_URL from '../../config/api.js';
import './DetallesEvento.css';
import PortadaPorDefecto from '../../assets/portada-default.jpg';

// Función para obtener imágenes con prefijo /storage/
const obtenerImagen = (ruta) => {
    if (!ruta) return null;
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
    const URL_STORAGE = `${API_URL}/storage/`;
    return `${URL_STORAGE}${ruta.startsWith('/') ? ruta.substring(1) : ruta}`;
};

const DetallesEvento = ({ eventoBuscado }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);

    const {
        id,
        nombre,
        nombre_sala,
        ubicacion,
        imagen,
        fecha_evento,
        url_venta,
        estilos = [],
        usuario,
        descripcion,
        colaboradores = []
    } = eventoBuscado || {};

    // Formatear fecha
    const formatearFecha = (fecha) => {
        if (!fecha) return 'Fecha no especificada';
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Inicializar mapa con ubicación
    useEffect(() => {
        if (!mapContainer.current || !ubicacion) return;

        if (map.current) return; // Evitar reinicializar

        const lat = ubicacion?.lat || ubicacion?.latitud;
        const lng = ubicacion?.lng || ubicacion?.longitud;

        if (!lat || !lng) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
            center: [parseFloat(lng), parseFloat(lat)],
            zoom: 14,
            pitch: 0,
            bearing: 0
        });

        // Agregar marcador del evento
        const el = document.createElement('div');
        el.style.cursor = 'pointer';
        el.style.userSelect = 'none';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))';

        // SVG del marcador
        el.innerHTML = `
            <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C7.16 0 0 7.16 0 16C0 26 16 40 16 40S32 26 32 16C32 7.16 24.84 0 16 0Z" fill="#0ADAF5"/>
                <circle cx="16" cy="16" r="6" fill="#fff"/>
            </svg>
        `;

        new maplibregl.Marker({ element: el })
            .setLngLat([parseFloat(lng), parseFloat(lat)])
            .addTo(map.current);

        map.current.addControl(new maplibregl.NavigationControl());
    }, [ubicacion]);

    if (!eventoBuscado) {
        return <div className="evento-no-encontrado">Evento no encontrado</div>;
    }

    const imagenUrl = obtenerImagen(imagen);
    const tieneImagen = !!imagenUrl;

    return (
        <div className="detalles-evento-page">
            {/* Hero Section con Imagen o Gradiente */}
            <div className={`evento-hero ${!tieneImagen ? 'sin-imagen' : ''}`}>
                {tieneImagen && (
                    <img
                        src={imagenUrl}
                        alt={nombre}
                        className="evento-imagen-hero"
                        onError={(e) => (e.target.style.display = 'none')}
                    />
                )}
                <div className="evento-overlay">
                    <div className="evento-header-info">
                        <h1>{nombre}</h1>
                        <p className="evento-sala">{nombre_sala}</p>
                    </div>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="evento-contenedor">
                {/* Lado Izquierdo - Información */}
                <div className="evento-info-section">
                    {/* Metadata Principal */}
                    <div className="evento-metadata">
                        <div className="metadata-item">
                            <span className="metadata-label">📅 Fecha</span>
                            <span className="metadata-valor">{formatearFecha(fecha_evento)}</span>
                        </div>

                        <div className="metadata-item">
                            <span className="metadata-label">📍 Ubicación</span>
                            <span className="metadata-valor">
                                {typeof ubicacion === 'object' && ubicacion?.direccion
                                    ? ubicacion.direccion
                                    : typeof ubicacion === 'string'
                                    ? ubicacion
                                    : 'Sin especificar'}
                            </span>
                        </div>
                    </div>

                    {/* Sección Estilos */}
                    {estilos && estilos.length > 0 && (
                        <div className="evento-estilos-section">
                            <h3>ESTILOS</h3>
                            <div className="estilos-list">
                                {estilos.map(estilo => (
                                    <span
                                        key={estilo.id}
                                        className="estilo-tag"
                                        style={{
                                            backgroundColor: estilo.color,
                                            color: '#000'
                                        }}
                                    >
                                        {estilo.nombre}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Descripción */}
                    {descripcion && (
                        <div className="evento-descripcion">
                            <h3>Sobre este evento</h3>
                            <p>{descripcion}</p>
                        </div>
                    )}

                    {/* Información del Creador */}
                    {usuario && (
                        <div className="evento-creador">
                            <h3>Creado por</h3>
                            <Link to={`/mostrar/usuario/${usuario.id}`} className="creador-card">
                                <img
                                    src={obtenerImagen(usuario.avatar) || 'https://via.placeholder.com/60'}
                                    alt={usuario.nick}
                                    className="creador-avatar"
                                />
                                <div className="creador-info">
                                    <h4>{usuario.nick}</h4>
                                    <p>{usuario.nombre}</p>
                                </div>
                                <span className="creador-link">→</span>
                            </Link>
                        </div>
                    )}

                    {/* Colaboradores */}
                    {colaboradores && colaboradores.length > 0 && (
                        <div className="evento-colaboradores">
                            <h3>Colaboradores</h3>
                            <div className="colaboradores-grid">
                                {colaboradores.map((colab) => (
                                    <Link key={colab.id} to={`/mostrar/usuario/${colab.id}`} className="colab-card">
                                        <img
                                            src={obtenerImagen(colab.avatar) || 'https://via.placeholder.com/60'}
                                            alt={colab.nick}
                                            className="colab-avatar"
                                        />
                                        <div className="colab-info">
                                            <h4>{colab.nick || colab.nombre}</h4>
                                        </div>
                                        <span className="colab-link">→</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Lado Derecho - Mapa y CTA */}
                <div className="evento-sidebar">
                    {/* Mapa */}
                    {ubicacion && (
                        <div className="evento-mapa-section">
                            <h3>Ubicación</h3>
                            <div className="evento-mapa" ref={mapContainer}></div>
                        </div>
                    )}

                    {/* CTA Button */}
                    <div className="evento-cta">
                        {url_venta ? (
                            <a href={url_venta} target="_blank" rel="noopener noreferrer" className="btn-comprar">
                                🎟️ Comprar Entradas
                            </a>
                        ) : (
                            <button className="btn-comprar disabled">
                                🎟️ Sin venta online
                            </button>
                        )}
                        <p className="cta-texto">¡No te pierdas este evento!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetallesEvento;
